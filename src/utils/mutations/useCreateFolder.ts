import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.createFolder.useMutation({
    onMutate: async (newFolder) => {
      const { name, userId, folderId } = newFolder;

      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: folderQueryKey,
      });

      // Snapshot the previous value
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      // Set the new folder data
      oldFolderData.folders.set(folderId, {
        id: folderId,
        folder_name: name,
        thumbnail_image: "📂",
        user_id: userId,
        boards: new Map<string, Board>(),
        collapsed: false,
        board_order: [],
      });

      // Optimistically update to the new value
      queryClient.setQueryData(folderQueryKey, {
        ...oldFolderData,
        folderOrder: [...oldFolderData.folderOrder, folderId],
      });

      return { oldFolderData, folderQueryKey };
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

export default useCreateFolder;
