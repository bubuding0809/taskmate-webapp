/* DONE BY: Ding RuoQian 2100971 */

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useToggleRevealSubtasks = () => {
  const queryClient = useQueryClient();

  return api.task.toggleRevealSubtasks.useMutation({
    onMutate: async (task) => {
      const { boardId, panelId, taskId, parentTaskId, reveal } = task;

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
      toggledTask!.is_reveal_subtasks = reveal;

      // Update task map
      newTaskMapData.get(taskId)!.is_reveal_subtasks = reveal;

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

export default useToggleRevealSubtasks;
