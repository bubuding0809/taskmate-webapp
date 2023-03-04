import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useUpdateSubtaskOrder = () => {
  const queryClient = useQueryClient();

  return api.task.updateSubtaskOrder.useMutation({
    onMutate: async (task) => {
      const {
        boardId,
        taskId,
        order,
        destinationPanelId,
        destinationParentTaskId,
        sourcePanelId,
        sourceParentTaskId,
        sourceIndex,
        destinationIndex,
      } = task;

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

      // Find source panel, source parent task
      const sourcePanel = newBoardData.Panel.find(
        (panel) => panel.id === sourcePanelId
      );
      const sourceParentTask = sourcePanel?.Task.find(
        (task) => task.id === sourceParentTaskId
      );

      // Find destination panel, destination parent task
      const destinationPanel = newBoardData.Panel.find(
        (panel) => panel.id === destinationPanelId
      );
      const destinationParentTask = destinationPanel?.Task.find(
        (task) => task.id === destinationParentTaskId
      );

      // Remove subtask from source parent task
      const removedSubtask = sourceParentTask!.subtasks.splice(
        sourceIndex,
        1
      )[0]!;

      // Insert subtask into destination parent task
      destinationParentTask?.subtasks.splice(
        destinationIndex,
        0,
        removedSubtask
      );

      // Remove task from source panel and insert into destination panel
      const taskIndex = sourcePanel!.Task.findIndex(
        (task) => task.id === taskId
      );
      const removedTask = sourcePanel!.Task.splice(taskIndex, 1)[0]!;
      destinationPanel!.Task.push(removedTask);

      // Update task in task map
      const targetTask = newTaskMapData.get(taskId)!;
      targetTask.panel_id = destinationPanelId;
      targetTask.parentTaskId = destinationParentTaskId;
      targetTask.order = order;

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

export default useUpdateSubtaskOrder;
