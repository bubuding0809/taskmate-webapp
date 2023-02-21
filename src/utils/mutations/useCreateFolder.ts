import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";

const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.createFolder.useMutation({
    onMutate: async (newFolder) => {
      const { name, userId, folderId } = newFolder;

      const queryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot the previous value
      const oldFolderData = queryClient.getQueryData(queryKey) as {
        folders: {
          [key: string]: Folder & {
            boards: Board[];
          };
        };
        folderOrder: string[];
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, {
        folders: {
          ...oldFolderData.folders,
          [folderId]: {
            id: folderId,
            folder_name: name,
            thumbnail_image: "📂",
            user_id: userId,
            board_order: null,
            collapsed: false,
          },
        },
        folderOrder: [...oldFolderData.folderOrder, folderId],
      });

      return { oldFolderData, queryKey };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.queryKey, ctx!.oldFolderData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useCreateFolder;
