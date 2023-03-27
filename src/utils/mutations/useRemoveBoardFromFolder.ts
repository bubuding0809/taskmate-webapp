/* DONE BY: Ding RuoQian 2100971 */

import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";
import _ from "lodash";

const useRemoveBoardFromFolder = () => {
  const queryClient = useQueryClient();

  return api.board.removeBoardFromFolder.useMutation({
    onMutate: async (board) => {
      const { userId, folderId, boardId, folderBoardOrder, rootBoardOrder } =
        board;

      // Create query key to access the board query data
      const boardQueryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
        { userId },
        "query"
      );

      // Create query key to access the folder query data
      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Create query key to access the board map data
      const boardMapQueryKey = getQueryKey(
        api.board.getUserBoardMap,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: boardQueryKey,
      });
      await queryClient.cancelQueries({
        queryKey: folderQueryKey,
      });
      await queryClient.cancelQueries({
        queryKey: boardMapQueryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      // Create deep copies of the old data to use for the optimistic update
      const newBoardData = _.cloneDeep(oldBoardData);
      const newFolderData = _.cloneDeep(oldFolderData);

      // Optimistically update unordered boards with the removed board
      newBoardData.boards.set(boardId, {
        ...newFolderData.folders.get(folderId)!.boards.get(boardId)!,
      });
      newBoardData.boardOrder = [...rootBoardOrder, boardId];
      queryClient.setQueryData(boardQueryKey, newBoardData);

      // Optimistically remove the board from the folder
      newFolderData.folders.get(folderId)!.board_order =
        folderBoardOrder.filter((bid) => bid !== boardId);
      newFolderData.folders.get(folderId)!.boards.delete(boardId);
      queryClient.setQueryData(folderQueryKey, newFolderData);

      setTimeout(
        () =>
          void (async () => {
            await queryClient.cancelQueries({
              queryKey: folderQueryKey,
            });
            await queryClient.cancelQueries({
              queryKey: boardQueryKey,
            });
            await queryClient.cancelQueries({
              queryKey: boardMapQueryKey,
            });
          })(),
        1
      );

      return {
        oldBoardData,
        boardQueryKey,
        folderQueryKey,
        oldFolderData,
        boardMapQueryKey,
      };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
      queryClient.setQueryData(ctx!.folderQueryKey, ctx!.oldFolderData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ctx?.folderQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardMapQueryKey,
      });
    },
  });
};

export default useRemoveBoardFromFolder;
