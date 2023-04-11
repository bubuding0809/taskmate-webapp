/* DONE BY: Ding RuoQian 2100971 */

import { handlePusherUpdate } from "@/utils/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import type { BoardWithPanelsAndTasks } from "server/api/routers/board";
import { TaskDetailed } from "server/api/routers/board";
import { api } from "utils/api";

const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();

  return api.task.createTask.useMutation({
    onMutate: async (task) => {
      const {
        boardId,
        panelId,
        postTaskOrder,
        taskId,
        title,
        details,
        startDate,
        endDate,
        dueDate,
        parentTaskId,
        taskAssignees,
        creatorId,
      } = task;

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

      const newTask = {
        panel_id: panelId,
        id: taskId,
        task_title: title,
        task_details: details ?? "",
        order: postTaskOrder ? Math.floor(postTaskOrder / 2) : 0,
        is_completed: false,
        start_datetime: startDate,
        end_datetime: endDate,
        due_datetime: dueDate,
        parentTaskId: parentTaskId ?? null,
        subtasks: [],
        is_reveal_subtasks: false,
        Task_Assign_Rel: [],
        task_description: {},
        created_at: new Date(),
        updated_at: new Date(),
        creator_id: creatorId,
      };

      // Add the new task to the task map
      newTaskMapData.set(taskId, {
        ...newTask,
        Attachment: [],
        Task_Activity: [],
      });

      // Locate the panel that the task is being added to, and add the task to the beginning of the array
      newBoardData.Panel.find((panel) => panel.id === panelId)!.Task.unshift({
        ...newTask,
        Creator: {
          id: creatorId,
          name: "",
          email: "",
          board_order: "",
          emailVerified: null,
          image: "",
          folder_order: "",
          password: "",
          status_message: "",
        },
        parentTask: parentTaskId ? newTaskMapData.get(parentTaskId)! : null,
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

export default useCreateTask;
