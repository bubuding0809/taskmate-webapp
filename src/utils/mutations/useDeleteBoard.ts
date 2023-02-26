import { Board } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return api.board.deleteBoard.useMutation({
    onMutate: async (Board) => {
      const {
        boardId,
        userId,
        folderBoardOrder,
        isOrganized,
        rootBoardOrder,
        folderId,
      } = Board;

      // Create query key for the folder query
      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Create query key for the board query
      const boardQueryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
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

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[] | null;
      };

      // If the board is not organized, remove it from the root board list
      if (!isOrganized) {
        oldBoardData.boards.delete(boardId);
        const newBoardOrder = oldBoardData.boardOrder?.filter(
          (id) => id !== boardId
        );
        queryClient.setQueryData(boardQueryKey, {
          ...oldBoardData,
          boardOrder:
            newBoardOrder && newBoardOrder.length > 0 ? newBoardOrder : null,
        });
      } else {
        // If the board is organized, remove it from the folder board list
        oldFolderData.folders.get(folderId!)!.boards.delete(boardId);
        const newFolderBoardOrder =
          folderBoardOrder?.filter(
            (folderBoardId) => folderBoardId !== boardId
          ) ?? [];
        oldFolderData.folders.get(folderId!)!.board_order = newFolderBoardOrder;
        console.log("newest folder data", oldFolderData);
        queryClient.setQueryData(folderQueryKey, oldFolderData);
      }

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      // This is a hack to make sure that any queries that are refetched after the mutation is executed is cancelled to prevent the optimistic update from being overwritten
      // The cancel queries will execute after the forced query refetching after the mutation is executed
      setTimeout(async () => {
        await queryClient.cancelQueries({
          queryKey: folderQueryKey,
        });
        await queryClient.cancelQueries({
          queryKey: boardQueryKey,
        });
      }, 1);

      return { oldFolderData, folderQueryKey, boardQueryKey, oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.folderQueryKey, ctx!.oldFolderData);
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.folderQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardQueryKey,
      });
    },
  });
};

export default useDeleteBoard;
