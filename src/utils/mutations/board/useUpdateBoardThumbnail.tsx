/* DONE BY: Ding RuoQian 2100971 */

import { handlePusherUpdate } from "@/utils/pusher";
import { useSession } from "next-auth/react";
import { api } from "utils/api";
import _ from "lodash";

const useUpdateBoardThumbnail = () => {
  const utils = api.useContext();
  const { data: sessionData } = useSession();

  return api.board.updateBoardThumbnail.useMutation({
    onMutate: async (variables) => {
      const { boardId, thumbnail, userId } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.board.getBoardById.cancel({ boardId });

      // Snapshot the previous value for boards
      const oldBoardData = utils.board.getBoardById.getData({
        boardId,
      });

      // Optimistically update to the new value
      if (oldBoardData) {
        utils.board.getBoardById.setData(
          { boardId },
          {
            ...oldBoardData,
            thumbnail_image: thumbnail,
          }
        );
      }

      return { oldBoardData };
    },
    onError: (_error, variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.board.getBoardById.setData(
        { boardId: variables.boardId },
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
      utils.board.getBoardById.invalidate({ boardId: variables.boardId });
      utils.board.getUserBoardWithoutFolder.invalidate({
        userId: variables.userId,
      });
      utils.folder.getAllUserFolders.invalidate({ userId: variables.userId });
    },
  });
};

export default useUpdateBoardThumbnail;
