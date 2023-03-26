import { Board } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { FolderWithBoards } from "server/api/routers/folder";
import { api } from "../api";

const useRenameBoard = () => {
  const queryClient = useQueryClient();

  return api.board.renameBoard.useMutation({
    onMutate: async (board) => {
      const { userId, boardId, title, folderId, isOrganized } = board;

      // Create query key to access the query data
      const boardQueryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
        { userId },
        "query"
      );
      const folderQueryKey = getQueryKey(
        api.folder.getAllUserFolders,
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

      // Snapshot the previous value for both queries
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      const newBoardData = _.cloneDeep(oldBoardData);
      const newFolderData = _.cloneDeep(oldFolderData);

      if (!isOrganized) {
        // Optimistically update the board data that is not organized
        newBoardData.boards.get(boardId)!.board_title = title;
        queryClient.setQueryData(boardQueryKey, newBoardData);
      } else {
        // Optimistically update the board data that is organized, from the folder
        newFolderData.folders.get(folderId!)!.boards.get(boardId)!.board_title =
          title;
        queryClient.setQueryData(folderQueryKey, newFolderData);
      }

      return { oldBoardData, boardQueryKey, oldFolderData, folderQueryKey };
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

      await queryClient.invalidateQueries({
        queryKey: ctx?.folderQueryKey,
      });

      await queryClient.invalidateQueries({
        queryKey: getQueryKey(
          api.board.getBoardById,
          { boardId: _variables.boardId },
          "query"
        ),
      });
    },
  });
};

export default useRenameBoard;
