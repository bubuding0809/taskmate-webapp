import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";

const useRenameFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.renameFolder.useMutation({
    onMutate: (folder) => {
      const { folderId, newName, userId } = folder;

      // Create query key to access the query data
      const queryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      queryClient.cancelQueries({
        queryKey: queryKey,
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
      const newFolderData = {
        folders: {
          ...oldFolderData.folders,
          [folderId]: {
            ...oldFolderData.folders[folderId],
            folder_name: newName,
          },
        },
        folderOrder: oldFolderData.folderOrder,
      };

      console.log("newFolderData", newFolderData);
      queryClient.setQueryData(queryKey, newFolderData);

      return { oldFolderData, queryKey };
    },
    onError: (error, variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx?.queryKey!, ctx?.oldFolderData);
    },
    onSettled(data, error, variables, ctx) {
      // Always refetch query after error or success to make sure the server state is correct
      queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useRenameFolder;
