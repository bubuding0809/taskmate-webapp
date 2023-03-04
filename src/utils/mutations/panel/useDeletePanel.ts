import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "utils/api";
import _ from "lodash";

import type { BoardWithPanelsAndTasks } from "server/api/routers/board";

const useDeletePanel = () => {
  const queryClient = useQueryClient();

  return api.panel.deletePanel.useMutation({
    onMutate: async (panel) => {
      const { panelId, boardId } = panel;

      // Create query key for the board query
      const queryKey = getQueryKey(
        api.board.getBoardById,
        { boardId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(
        queryKey
      ) as BoardWithPanelsAndTasks;

      const newBoardData = _.cloneDeep(oldBoardData);
      // Remove the panel from the board
      newBoardData.Panel = newBoardData.Panel.filter(
        (pid) => pid.id !== panelId
      );

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newBoardData);

      return { queryKey, oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.queryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useDeletePanel;
