import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();

  return api.task.toggleTaskStatus.useMutation({
    onMutate: async (task) => {
      const { boardId, panelId, taskId, parentTaskId, completed } = task;

      // Create query key for the board query
      const boardQueryKey = getQueryKey(
        api.board.getBoardById,
        { boardId },
        "query"
      );

      const taskMapQueryKey = getQueryKey(
        api.board.getTasksMapByBoardId,
        { boardId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: boardQueryKey,
      });
      await queryClient.cancelQueries({
        queryKey: taskMapQueryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(
        boardQueryKey
      ) as BoardWithPanelsAndTasks;

      const oldTaskMapData = queryClient.getQueryData(taskMapQueryKey) as Map<
        string,
        TaskDetailed
      >;

      const newBoardData = _.cloneDeep(oldBoardData);
      const newTaskMapData = _.cloneDeep(oldTaskMapData);

      const panel = newBoardData.Panel.find((p) => p.id === panelId);
      const toggledTask = panel?.Task.find((t) => t.id === taskId);

      // Update the status of the toggled task in the panel
      toggledTask!.is_completed = completed;

      // If the toggled task is a subtask, make sure to update it within the subtasks array of the parent task
      if (parentTaskId) {
        const parentTask = panel!.Task.find((t) => t.id === parentTaskId)!;
        parentTask.subtasks.find((st) => st.id === taskId)!.is_completed =
          completed;

        // If task is being marked as uncompleted, make sure to mark the parent task as uncompleted as well
        if (!completed) {
          parentTask.is_completed = false;
        }
      }

      // If the toggled task is a parent task, make sure to update the status of all of its subtasks
      toggledTask?.subtasks?.forEach((subTask) => {
        if (completed) {
          subTask.is_completed = true;
          newTaskMapData.get(subTask.id)!.is_completed = true;
        }
      });

      // Update task map
      newTaskMapData.get(taskId)!.is_completed = completed;

      // Optimistically update to the new value
      queryClient.setQueryData(taskMapQueryKey, newTaskMapData);
      queryClient.setQueryData(boardQueryKey, newBoardData);

      return { boardQueryKey, oldBoardData, taskMapQueryKey, oldTaskMapData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
      queryClient.setQueriesData(ctx!.taskMapQueryKey, ctx!.oldTaskMapData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ctx?.taskMapQueryKey,
      });
    },
  });
};

export default useToggleTaskStatus;
