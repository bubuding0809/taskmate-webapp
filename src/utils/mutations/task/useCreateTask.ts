/* DONE BY: Ding RuoQian 2100971 */

import { handlePusherUpdate } from "@/utils/pusher";
import { useSession } from "next-auth/react";
import { api } from "utils/api";
import _ from "lodash";

const useCreateTask = () => {
  const utils = api.useContext();
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

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      utils.board.getBoardById.cancel({ boardId });
      utils.board.getTasksMapByBoardId.cancel({ boardId });

      // Snapshot the previous value for boards
      const oldBoardData = utils.board.getBoardById.getData({
        boardId,
      });

      const oldTaskMapData = utils.board.getTasksMapByBoardId.getData({
        boardId,
      });

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
        task_description: { type: "doc" },
        created_at: new Date(),
        updated_at: new Date(),
        creator_id: creatorId,
      };

      if (newBoardData && newTaskMapData) {
        // Add the new task to the task map
        newTaskMapData.set(taskId, {
          ...newTask,
          Attachment: [],
          Task_Activity: [],
        });

        // Locate the panel that the task is being added to, and add the task to the beginning of the array
        newBoardData.Panel.find((panel) => panel.id === panelId)?.Task.unshift({
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
        utils.board.getBoardById.setData({ boardId: boardId }, newBoardData);
        utils.board.getTasksMapByBoardId.setData(
          { boardId: boardId },
          newTaskMapData
        );
      }

      return { oldBoardData, oldTaskMapData };
    },
    onError: (_error, variables, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.board.getBoardById.setData(
        {
          boardId: variables.boardId,
        },
        ctx!.oldBoardData
      );

      utils.board.getTasksMapByBoardId.setData(
        {
          boardId: variables.boardId,
        },
        ctx!.oldTaskMapData
      );
    },
    onSettled: async (_data, _error, variables) => {
      // Sender update to pusher
      handlePusherUpdate({
        bid: variables.boardId,
        sender: sessionData!.user.id,
      });

      // Always refetch query after error or success to make sure the server state is correct
      utils.board.getBoardById.invalidate({ boardId: variables.boardId });
      utils.board.getTasksMapByBoardId.invalidate({
        boardId: variables.boardId,
      });
    },
  });
};

export default useCreateTask;
