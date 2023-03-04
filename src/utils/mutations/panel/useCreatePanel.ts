import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { api } from "utils/api";

const useCreatePanel = () => {
  const queryClient = useQueryClient();

  return api.panel.createPanel.useMutation({
    onMutate: async (panel) => {
      const { boardId, userId, prevPanelOrder, title, color, panelId } = panel;

      // Create query key for the board query
      const queryKey = getQueryKey(
        api.board.getBoardById,
        { boardId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(
        queryKey
      ) as BoardWithPanelsAndTasks;

      const newBoardData = _.cloneDeep(oldBoardData);
      newBoardData.Panel.push({
        id: panelId,
        board_id: boardId,
        order: prevPanelOrder + 100,
        is_visible: true,
        panel_title: title ?? null,
        panel_color: color ?? null,
        Task: [],
        show_completed_tasks: false,
      });

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newBoardData);

      return { queryKey, oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.queryKey, ctx!.oldBoardData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.queryKey,
      });
    },
  });
};

export default useCreatePanel;
