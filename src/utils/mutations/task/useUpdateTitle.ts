/* DONE BY: Ding RuoQian 2100971 */

import _ from "lodash";
import { handlePusherUpdate } from "@/utils/pusher";
import { useSession } from "next-auth/react";
import { api } from "utils/api";

const useUpdateTitle = () => {
  // const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  const utils = api.useContext();

  return api.task.updateTitle.useMutation({
    onMutate: async (variables) => {
      const { boardId, panelId, taskId, title } = variables;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.board.getBoardById.cancel({
        boardId,
      });

      // Snapshot the previous value for boards
      const oldBoardData = utils.board.getBoardById.getData({
        boardId,
      });

      // Optimistically update to the new value
      utils.board.getBoardById.setData({ boardId }, (prev) => {
        const newBoardData = _.cloneDeep(prev);

        // Find the task
        const task = newBoardData?.Panel.find(
          (panel) => panel.id === panelId
        )?.Task.find((task) => task.id === taskId);

        // Update the task title if found
        if (task) {
          task.task_title = title;
        }

        return newBoardData;
      });

      return { oldBoardData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.board.getBoardById.setData(
        {
          boardId: ctx!.oldBoardData!.id,
        },
        ctx!.oldBoardData
      );
    },
    onSettled: (_data, _error, variables) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });

      // Always refetch query after error or success to make sure the server state is correct
      void utils.board.getBoardById.invalidate({
        boardId: variables.boardId,
      });
    },
  });
};

export default useUpdateTitle;
