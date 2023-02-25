import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";

const useAddBoardToFolder = () => {
  const queryClient = useQueryClient();

  return api.board.addBoardToFolder.useMutation({
    onMutate: async (board) => {
      const { boardOrder, userId, folderId, boardId } = board;

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

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: boardQueryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, Folder & { boards: Board[] }>;
        folderOrder: string[];
      };

      // Optimistically update boards to the new value
      queryClient.setQueryData(boardQueryKey, {
        ...oldBoardData,
        boardOrder: boardOrder,
      });

      // Optimistically update folders to the new value
      oldFolderData.folders.set(folderId, {
        ...oldFolderData.folders.get(folderId)!,
        boards: [
          ...oldFolderData.folders.get(folderId)!.boards,
          oldBoardData.boards.get(boardId)!,
        ],
      });

      return { oldBoardData, boardQueryKey, folderQueryKey, oldFolderData };
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
    },
  });
};

export default useAddBoardToFolder;
