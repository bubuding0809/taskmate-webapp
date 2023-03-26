import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";
import _ from "lodash";

import type {
  BoardDetailed,
  FolderWithBoards,
} from "server/api/routers/folder";

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

      const newFolderData = _.cloneDeep(oldFolderData);

      // Set the new folder data
      newFolderData.folders.set(folderId, {
        id: folderId,
        folder_name: name,
        thumbnail_image: "📂",
        user_id: userId,
        boards: new Map<string, BoardDetailed>(),
        collapsed: false,
        board_order: [],
      });

      // Set the new folder order, by adding the new folder id to the end
      newFolderData.folderOrder.push(folderId);

      // Optimistically update to the new value
      queryClient.setQueryData(folderQueryKey, newFolderData);

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
