import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";

const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.deleteFolder.useMutation({
    onMutate: async (folder) => {
      const { folderId, userId } = folder;

      // Create query key to access the query data
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
          // Remove the folder from the folders object
          [folderId]: undefined,
        },
        folderOrder: oldFolderData.folderOrder.filter((id) => id !== folderId),
      });

      return { oldFolderData, queryKey };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx?.queryKey!, ctx?.oldFolderData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useDeleteFolder;
