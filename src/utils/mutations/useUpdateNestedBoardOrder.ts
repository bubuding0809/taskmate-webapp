/* DONE BY: Ding RuoQian 2100971 */

import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useUpdateNestedBoardOrder = () => {
  const queryClient = useQueryClient();

  return api.board.updateFolderBoardOrder.useMutation({
    onMutate: async (board) => {
      const {
        userId,
        boardId,
        destinationBoardOrder,
        destinationFolderId,
        isSameFolder,
        sourceBoardOrder,
        sourceFolderId,
      } = board;

      // Create query key to access the folder query data
      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: folderQueryKey,
      });

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      // Create a deep copy of the previous value for folders, this to prevent the query state from being mutated
      const newFolderData = _.cloneDeep(oldFolderData);

      const draggedBoard = newFolderData.folders
        .get(sourceFolderId)!
        .boards.get(boardId)!;

      // First update the board order of the source folder
      newFolderData.folders.get(sourceFolderId)!.board_order = sourceBoardOrder;

      // Remove the board from the source folder
      newFolderData.folders.get(sourceFolderId)!.boards.delete(boardId);

      // Add the board to the destination folder
      newFolderData.folders
        .get(destinationFolderId)!
        .boards.set(boardId, draggedBoard);

      // If the board is being moved to a different folder, update the destination folder board order with the new board order
      if (!isSameFolder) {
        newFolderData.folders.get(destinationFolderId)!.board_order =
          destinationBoardOrder;
      }

      // Optimistically update folders to the new value
      queryClient.setQueryData(folderQueryKey, newFolderData);

      setTimeout(
        () =>
          void (async () => {
            await queryClient.cancelQueries({
              queryKey: folderQueryKey,
            });
          })(),
        1
      );

      return { folderQueryKey, oldFolderData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.folderQueryKey, ctx!.oldFolderData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.folderQueryKey,
      });
    },
  });
};

export default useUpdateNestedBoardOrder;
