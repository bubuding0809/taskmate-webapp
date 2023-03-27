/* DONE BY: Ding RuoQian 2100971 */

import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { api } from "../api";

const useUpdateBoardOrder = () => {
  const queryClient = useQueryClient();

  return api.board.updateBoardOrder.useMutation({
    onMutate: async (board) => {
      const { boardOrder, userId } = board;

      // Create query key to access the query data
      const queryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      // Snapshot the previous value
      const oldBoardData = queryClient.getQueryData(queryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      const newBoardData = _.cloneDeep(oldBoardData);

      // Optimistically update to the new value
      newBoardData.boardOrder = boardOrder;
      queryClient.setQueryData(queryKey, newBoardData);

      return { oldBoardData, queryKey };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.queryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useUpdateBoardOrder;
