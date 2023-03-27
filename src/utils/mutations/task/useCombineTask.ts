import { handlePusherUpdate } from "@/utils/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useCombineTask = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  return api.task.combineTask.useMutation({
    onMutate: async (task) => {
      const { boardId, panelId, taskId, parentTaskId, order } = task;

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

      // Get parent task by first finding the panel, then finding the task
      const parentTask = newBoardData.Panel.find(
        (panel) => panel.id === panelId
      )?.Task.find((task) => task.id === parentTaskId);

      // Get subtask by first finding the panel, then finding the task
      const originPanel = newTaskMapData.get(taskId)?.panel_id;
      const subtask = newBoardData.Panel.find(
        (panel) => panel.id === originPanel
      )?.Task.find((task) => task.id === taskId);

      if (parentTask && subtask) {
        // Connect the subtask to the parent task, this will remove the subtask from the panel root
        subtask.parentTaskId = parentTaskId;

        // Add the subtask to the parent task's subtasks
        parentTask.subtasks.push(subtask);

        newTaskMapData.get(parentTaskId)!.subtasks.push(subtask);
        newTaskMapData.get(taskId)!.parentTaskId = parentTaskId;

        // Optimistically update to the new value
        queryClient.setQueryData(taskMapQueryKey, newTaskMapData);
        queryClient.setQueryData(boardQueryKey, newBoardData);
      }

      return { boardQueryKey, oldBoardData, taskMapQueryKey, oldTaskMapData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
      queryClient.setQueriesData(ctx!.taskMapQueryKey, ctx!.oldTaskMapData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });

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

export default useCombineTask;
