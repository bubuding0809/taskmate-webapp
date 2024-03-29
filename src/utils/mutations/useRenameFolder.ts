/* DONE BY: Ding RuoQian 2100971 */

import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useRenameFolder = () => {
  const queryClient = useQueryClient();

  return api.folder.renameFolder.useMutation({
    onMutate: async (folder) => {
      const { folderId, newName, userId } = folder;

      // Create query key to access the query data
      const queryKey = getQueryKey(
        api.folder.getAllUserFolders,
        { userId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      // Snapshot the previous value
      const oldFolderData = queryClient.getQueryData(queryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      const newFolderData = _.cloneDeep(oldFolderData);

      // Optimistically update to the new value
      newFolderData.folders.get(folderId)!.folder_name = newName;
      queryClient.setQueryData(queryKey, newFolderData);

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

export default useRenameFolder;
