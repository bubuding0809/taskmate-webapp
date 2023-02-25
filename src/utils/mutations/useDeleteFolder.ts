import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";

const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.deleteFolder.useMutation({
    onMutate: async (folder) => {
      const { folderId, userId, boardIdsToBeUpdated } = folder;

      // Create query key to access the query data
      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      const boardQueryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: folderQueryKey,
      });

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, Folder & { boards: Board[] }>;
        folderOrder: string[];
      };

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      // Add boards that were in the folder to the unorganized board list
      oldFolderData.folders.get(folderId)!.boards.forEach((board) => {
        oldBoardData.boards.set(board.id, board);
      });

      // Set the new folder data
      oldFolderData.folders.delete(folderId);

      // Optimistically update the board data
      queryClient.setQueryData(boardQueryKey, {
        ...oldBoardData,
        boardOrder: [...oldBoardData.boardOrder, ...boardIdsToBeUpdated],
      });

      // Optimistically update the folder data
      queryClient.setQueryData(folderQueryKey, {
        ...oldFolderData,
        folderOrder: oldFolderData.folderOrder.filter((id) => id !== folderId),
      });

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

export default useDeleteFolder;
