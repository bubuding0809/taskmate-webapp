import { Board, Folder } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { api } from "../api";

const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return api.board.createBoard.useMutation({
    onMutate: async (newFolder) => {
      const { userId, boardId, currentBoardOrder, title } = newFolder;

      const boardQueryKey = getQueryKey(
        api.board.getUserBoardWithoutFolder,
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

      const newBoardData = _.cloneDeep(oldBoardData);

      // Update the unorganized board map with the new board
      newBoardData.boards.set(boardId, {
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
      });
      newBoardData.boardOrder = [...currentBoardOrder, boardId];

      // Optimistically update boards to the new value
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
          })(),
        1
      );

      return { oldBoardData, boardQueryKey };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, _variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardQueryKey,
      });
    },
  });
};

export default useCreateBoard;
