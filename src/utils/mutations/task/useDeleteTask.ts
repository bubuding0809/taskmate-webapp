import { handlePusherUpdate } from "@/utils/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  return api.task.deleteTask.useMutation({
    onMutate: async (task) => {
      const { boardId, panelId, taskId } = task;

      // Create query key for the board query
      const boardQueryKey = getQueryKey(
        api.board.getBoardById,
        { boardId },
        "query"
      );

      // Create query key for the task map query
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

      // Locate the panel that the task is being deleted from
      const targetPanel = newBoardData.Panel.find(
        (panel) => panel.id === panelId
      );

      // Find the parent task of the task being deleted, if it exists
      const parentTask = targetPanel?.Task.find(
        (task) => task.id === newTaskMapData.get(taskId)?.parentTaskId
      );

      // If task is a subtask, find the parent task and remove the task from it's subtasks
      if (parentTask) {
        parentTask.subtasks = parentTask.subtasks.filter(
          (task) => task.id !== taskId
        );
      }
      // Remove the task from the panel as well
      targetPanel!.Task = targetPanel!.Task.filter(
        (task) => task.id !== taskId
      );

      // Remove the task from the task map
      newTaskMapData.delete(taskId);

      // Optimistically update to the new value
      queryClient.setQueryData(boardQueryKey, newBoardData);
      queryClient.setQueryData(taskMapQueryKey, newTaskMapData);

      return { boardQueryKey, oldBoardData, taskMapQueryKey, oldTaskMapData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
      queryClient.setQueryData(ctx!.taskMapQueryKey, ctx!.oldTaskMapData);
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

export default useDeleteTask;
