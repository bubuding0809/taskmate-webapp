import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "../api";
import _ from "lodash";

import type { Board } from "@prisma/client";
import type {
  BoardDetailed,
  FolderWithBoards,
} from "server/api/routers/folder";

const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return api.board.createBoard.useMutation({
    onMutate: async (newFolder) => {
      const {
        userId,
        boardId,
        currentBoardOrder,
        title,
        folderId,
        folderBoardOrder,
      } = newFolder;

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

      // Create query key to access the board map data
      const boardMapQueryKey = getQueryKey(
        api.board.getUserBoardMap,
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
      await queryClient.cancelQueries({
        queryKey: boardMapQueryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(boardQueryKey) as {
        boards: Map<string, Board>;
        boardOrder: string[];
      };

      // Snapshot the previous value for folders
      const oldFolderData = queryClient.getQueryData(folderQueryKey) as {
        folders: Map<string, FolderWithBoards>;
        folderOrder: string[];
      };

      const newFolderData = _.cloneDeep(oldFolderData);
      const newBoardData = _.cloneDeep(oldBoardData);

      const newBoard: BoardDetailed = {
        id: boardId,
        user_id: userId,
        folder_id: null,
        board_title: title,
        board_description: null,
        panelOrder: null,
        visibility: "PRIVATE",
        background_image: null,
        background_color: null,
        cover_image: null,
        thumbnail_image: "📝",
        created_at: new Date(),
        updated_at: new Date(),
        Board_Collaborator: [],
        Board_Message: [],
        Board_Tag: [],
        Team_Board_Rel: [],
        user: {
          id: userId,
          email: "",
          name: "",
          image: "",
          emailVerified: new Date(),
          board_order: "",
          folder_order: "",
          status_message: "Im using TaskMate!",
        },
      };

      // If the board is being created in a folder, update the folder map with the new board
      if (folderId && folderBoardOrder) {
        const folder = newFolderData.folders.get(folderId)!;
        folder.boards.set(boardId, {
          ...newBoard,
        });
        folder.board_order = [...folderBoardOrder, boardId];
      } else {
        // Update the unorganized board map with the new board
        newBoardData.boards.set(boardId, newBoard);
        newBoardData.boardOrder = [...currentBoardOrder, boardId];
      }

      // Optimistically update boards to the new value
      queryClient.setQueryData(folderQueryKey, newFolderData);
      queryClient.setQueryData(boardQueryKey, newBoardData);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      // This is a hack to make sure that any queries that are refetched after the mutation is executed is cancelled to prevent the optimistic update from being overwritten
      // The cancel queries will execute after the forced query refetching after the mutation is executed
      setTimeout(
        () =>
          void (async () => {
            await queryClient.cancelQueries({
              queryKey: boardQueryKey,
            });
            await queryClient.cancelQueries({
              queryKey: folderQueryKey,
            });
            await queryClient.cancelQueries({
              queryKey: boardMapQueryKey,
            });
          })(),
        1
      );

      return {
        oldBoardData,
        boardQueryKey,
        oldFolderData,
        folderQueryKey,
        boardMapQueryKey,
      };
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
        queryKey: ctx?.boardMapQueryKey,
      });
    },
  });
};

export default useCreateBoard;
