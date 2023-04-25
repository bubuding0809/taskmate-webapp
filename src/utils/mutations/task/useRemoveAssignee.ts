/* DONE BY: Ding RuoQian 2100971 */

import _ from "lodash";
import { handlePusherUpdate } from "@/utils/pusher";
import { useSession } from "next-auth/react";
import { api } from "utils/api";

const useRemoveAssignee = () => {
  const utils = api.useContext();
  const { data: sessionData } = useSession();

  return api.task.removeAssignee.useMutation({
    onMutate: async (variables) => {
      const { boardId, assigneeId, panelId, taskId } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.board.getBoardById.cancel({
        boardId,
      });

      // Snapshot the previous value for boards
      const oldBoardData = utils.board.getBoardById.getData({
        boardId,
      });

      return { oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.board.getBoardById.setData(
        {
          boardId: ctx!.oldBoardData!.id,
        },
        ctx!.oldBoardData
      );
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });

      // Always refetch query after error or success to make sure the server state is correct
      utils.board.getBoardById.invalidate({
        boardId: variables.boardId,
      });
    },
  });
};

export default useRemoveAssignee;
