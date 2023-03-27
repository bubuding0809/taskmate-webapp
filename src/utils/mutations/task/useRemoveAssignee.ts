/* DONE BY: Ding RuoQian 2100971 */

import { handlePusherUpdate } from "@/utils/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import { BoardWithPanelsAndTasksAndCollaborators } from "server/api/routers/board";
import { api } from "utils/api";

const useRemoveAssignee = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  return api.task.removeAssignee.useMutation({
    onMutate: async (variables) => {
      const { boardId, assigneeId, panelId, taskId } = variables;

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
      ) as BoardWithPanelsAndTasksAndCollaborators;

      return { queryKey, oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.queryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });

      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useRemoveAssignee;
