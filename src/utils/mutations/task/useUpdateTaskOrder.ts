/* DONE BY: Ding RuoQian 2100971 */

import { handlePusherUpdate } from "@/utils/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useUpdateTaskOrder = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  return api.task.updateTaskOrder.useMutation({
    onMutate: async (task) => {
      const { boardId, sourcePanelId, destinationPanelId, taskId, order } =
        task;

      // Create query key for the board query
      const boardQueryKey = getQueryKey(
        api.board.getBoardById,
        { boardId },
        "query"
      );

      const taskMapQueryKey = getQueryKey(
        api.board.getTasksMapByBoardId,
        { boardId },
        "query"
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: boardQueryKey,
      });
      await queryClient.cancelQueries({
        queryKey: taskMapQueryKey,
      });

      // Snapshot the previous value for boards
      const oldBoardData = queryClient.getQueryData(
        boardQueryKey
      ) as BoardWithPanelsAndTasks;

      const oldTaskMapData = queryClient.getQueryData(taskMapQueryKey) as Map<
        string,
        TaskDetailed
      >;

      const newBoardData = _.cloneDeep(oldBoardData);
      const newTaskMapData = _.cloneDeep(oldTaskMapData);

      // Find source panel
      const sourcePanel = newBoardData.Panel.find(
        (panel) => panel.id === sourcePanelId
      );
      // Find destination panel
      const destinationPanel = newBoardData.Panel.find(
        (panel) => panel.id === destinationPanelId
      );

      // Remove task from source panel and insert into destination panel
      const taskIndex = sourcePanel?.Task.findIndex(
        (task) => task.id === taskId
      );
      const removedTask = sourcePanel?.Task.splice(taskIndex!, 1)[0];
      removedTask!.order = order;

      // Insert task into destination panel then sort by order
      destinationPanel?.Task.push(removedTask!);
      destinationPanel?.Task.sort((a, b) => a.order - b.order);

      // Filter out all subtasks that belonged to the task from the source panel
      const removedSubtasks = sourcePanel?.Task.filter(
        (task) => task.parentTaskId === taskId
      );
      sourcePanel!.Task = sourcePanel!.Task.filter(
        (task) => task.parentTaskId !== taskId
      );

      // Add all subtasks that belong to the task to the destination panel
      destinationPanel!.Task = destinationPanel!.Task.concat(removedSubtasks!);

      // Update the task map with the new task order and panel id
      newTaskMapData.get(taskId)!.order = order;
      newTaskMapData.get(taskId)!.panel_id = destinationPanelId;

      // Update the task map with all subtasks
      removedSubtasks?.forEach((subtask) => {
        newTaskMapData.get(subtask.id)!.panel_id = destinationPanelId;
      });

      // Optimistically update to the new value
      queryClient.setQueryData(taskMapQueryKey, newTaskMapData);
      queryClient.setQueryData(boardQueryKey, newBoardData);

      return { boardQueryKey, oldBoardData, taskMapQueryKey, oldTaskMapData };
    },
    onError: (_error, _variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(ctx!.boardQueryKey, ctx!.oldBoardData);
      queryClient.setQueriesData(ctx!.taskMapQueryKey, ctx!.oldTaskMapData);
    },
    onSettled: async (_data, _error, variables, ctx) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });
      // Always refetch query after error or success to make sure the server state is correct
      await queryClient.invalidateQueries({
        queryKey: ctx?.boardQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ctx?.taskMapQueryKey,
      });
    },
  });
};

export default useUpdateTaskOrder;
