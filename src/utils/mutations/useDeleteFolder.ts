import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.deleteFolder.useMutation({
    onMutate: async (folder) => {
      const { folderId, userId } = folder;

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

      await queryClient.cancelQueries({
        queryKey: folderQueryKey,
      });
      await queryClient.cancelQueries({
        queryKey: boardQueryKey,
      });

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[] | null;
      };

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      const newBoardData = _.cloneDeep(oldBoardData);
      const newFolderData = _.cloneDeep(oldFolderData);

      // Optimistically update unordered boards with the removed folder's boards
      newFolderData.folders.get(folderId)!.boards.forEach((board) => {
        newBoardData.boards.set(board.id, board);
      });
      newFolderData.folders.delete(folderId);
      const newFolderOrder = newFolderData.folderOrder?.filter(
        (id) => id !== folderId
      );
      newFolderData.folderOrder =
        newFolderOrder && newFolderOrder.length > 0 ? newFolderOrder : null;
      queryClient.setQueryData(folderQueryKey, newFolderData);

      // Optimistically update the board data
      newBoardData.boardOrder = [
        ...newBoardData.boardOrder,
        ...oldFolderData.folders.get(folderId)!.board_order,
      ];

      queryClient.setQueryData(boardQueryKey, newBoardData);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      // This is a hack to make sure that any queries that are refetched after the mutation is executed is cancelled to prevent the optimistic update from being overwritten
      // The cancel queries will execute after the forced query refetching after the mutation is executed
      setTimeout(
        () =>
          (async () => {
            await queryClient.cancelQueries({
              queryKey: folderQueryKey,
            });
            await queryClient.cancelQueries({
              queryKey: boardQueryKey,
            });
          })(),
        1
      );

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
