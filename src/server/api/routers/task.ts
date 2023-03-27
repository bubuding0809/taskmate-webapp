/* DONE BY: Ding RuoQian 2100971 */
/* DONE BY: Amri Sazali 2102350 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const TASK_ORDER_STEP = 100;

export const taskRouter = createTRPCRouter({
  // Mutation to create a new task
  createTask: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        postTaskOrder: z.number(),
        title: z.string(),
        details: z.string().nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
        dueDate: z.date().nullable(),
        parentTaskId: z.string().optional(),
        taskAssignees: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If parentTaskId is provided then connect the task to the parent task
      if (input.parentTaskId) {
        return await ctx.prisma.task.create({
          data: {
            Panel: {
              connect: {
                id: input.panelId,
              },
            },
            id: input.taskId,
            order: input.postTaskOrder
              ? Math.floor(input.postTaskOrder / 2)
              : TASK_ORDER_STEP,
            task_title: input.title,
            task_details: input.details,
            start_datetime: input.startDate,
            end_datetime: input.endDate,
            due_datetime: input.dueDate,
            // If parentTaskId is provided then connect the task to the parent task
            parentTask: {
              connect: {
                id: input.parentTaskId,
              },
            },
            Task_Assign_Rel: {
              createMany: {
                data:
                  input.taskAssignees?.map((assigneeId) => ({
                    user_id: assigneeId,
                  })) ?? [],
              },
            },
          },
        });
      }

      // Else create the task without a parent task
      return await ctx.prisma.task.create({
        data: {
          Panel: {
            connect: {
              id: input.panelId,
            },
          },
          id: input.taskId,
          order: input.postTaskOrder
            ? Math.floor(input.postTaskOrder / 2)
            : TASK_ORDER_STEP,
          task_title: input.title,
          task_details: input.details,
          start_datetime: input.startDate,
          end_datetime: input.endDate,
          due_datetime: input.dueDate,
          Task_Assign_Rel: {
            createMany: {
              data:
                input.taskAssignees?.map((assigneeId) => ({
                  user_id: assigneeId,
                })) ?? [],
            },
          },
        },
      });
    }),

  // Mutation to delete a task
  deleteTask: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.delete({
        where: {
          id: input.taskId,
        },
      });
    }),

  // Mutation to update a task's order
  updateTaskOrder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        sourcePanelId: z.string(),
        destinationPanelId: z.string(),
        taskId: z.string(),
        order: z.number(),
        sourceIndex: z.number(),
        destinationIndex: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // First update the task's panel_id to the new panel_id
        await tx.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            panel_id: input.destinationPanelId,
          },
        });

        // Also update all its subtasks' panel_id to the new panel_id
        await tx.task.updateMany({
          where: {
            parentTaskId: input.taskId,
          },
          data: {
            panel_id: input.destinationPanelId,
          },
        });

        // Check if new order is already taken
        const taskWithOrder = await tx.task.findFirst({
          where: {
            panel_id: input.destinationPanelId,
            order: input.order,
          },
        });

        // if board order reaches 0 or if input.order is already taken, then increment all tasks' order
        if (input.order === 0 || taskWithOrder) {
          await tx.task.updateMany({
            where: {
              panel_id: input.destinationPanelId,
            },
            data: {
              order: {
                increment: TASK_ORDER_STEP,
              },
            },
          });

          return await tx.task.update({
            where: {
              id: input.taskId,
            },
            data: {
              order: taskWithOrder ? input.order : TASK_ORDER_STEP / 2,
            },
          });
        }

        // Else update the task's order to the new order
        return await tx.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            order: input.order,
          },
        });
      });
    }),

  // Mutation to update a subtask's order
  updateSubtaskOrder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        taskId: z.string(),
        order: z.number(),
        sourcePanelId: z.string(),
        sourceParentTaskId: z.string(),
        destinationPanelId: z.string(),
        destinationParentTaskId: z.string(),
        sourceIndex: z.number(),
        destinationIndex: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // First update the subtask's panel_id and parentTaskId to the new panel_id and parentTaskId
        await tx.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            panel_id: input.destinationPanelId,
            parentTaskId: input.destinationParentTaskId,
          },
        });

        // Check if new order is already taken
        const taskWithOrder = await tx.task.findFirst({
          where: {
            panel_id: input.destinationPanelId,
            parentTaskId: input.destinationParentTaskId,
            order: input.order,
          },
        });

        // if board order reaches 0 or if input.order is already taken, then increment all tasks' order
        if (input.order === 0 || taskWithOrder) {
          await tx.task.updateMany({
            where: {
              panel_id: input.destinationPanelId,
              parentTaskId: input.destinationParentTaskId,
            },
            data: {
              order: {
                increment: TASK_ORDER_STEP,
              },
            },
          });

          return await tx.task.update({
            where: {
              id: input.taskId,
            },
            data: {
              order: taskWithOrder ? input.order : TASK_ORDER_STEP / 2,
            },
          });
        }

        // Else update the task's order to the new order
        return await tx.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            order: input.order,
          },
        });
      });
    }),

  // Mutation to add combine a task with another task (i.e. creating a subtask)
  combineTask: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        parentTaskId: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Add the subtask to the parent task by connecting the subtask to the parent task and updating the subtask's order
      // Also connect the subtask to the new panel if the subtask is moved to a new panel
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          parentTask: {
            connect: {
              id: input.parentTaskId,
            },
          },
          Panel: {
            connect: {
              id: input.panelId,
            },
          },
          order: input.order + TASK_ORDER_STEP,
        },
      });
    }),

  // Mutation to remove a subtask from a parent task
  unappendSubtask: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        parentTaskId: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Remove the subtask from the parent task by disconnecting the subtask from the parent task
      // Also make sure to set the task's panel to the parent task's panel
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          order: input.order,
          Panel: {
            connect: {
              id: input.panelId,
            },
          },
          parentTask: {
            disconnect: true,
          },
        },
      });

      // ! There might be a edge case where the new order of the unappended subtask is already taken
    }),

  // Mutation to handle toggling a task's completed status
  toggleTaskStatus: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        parentTaskId: z.string().nullable(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If the task is being marked as uncompleted, then mark the parent task as uncompleted as well
      if (!input.completed) {
        return await ctx.prisma.task.updateMany({
          where: {
            OR: [
              {
                id: input.taskId,
              },
              {
                id: input.parentTaskId ?? "",
              },
            ],
          },
          data: {
            is_completed: false,
          },
        });
      }

      // Else just toggle the task's completed status
      return await ctx.prisma.task.updateMany({
        where: {
          OR: [
            {
              id: input.taskId,
            },
            {
              parentTaskId: input.taskId,
            },
          ],
        },
        data: {
          is_completed: input.completed,
        },
      });
    }),

  //Mutation to handle toggling of reveal subtasks
  toggleRevealSubtasks: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        parentTaskId: z.string().nullable(),
        reveal: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          is_reveal_subtasks: input.reveal,
        },
      });
    }),

  // Mutation to remove a assignee from a task
  removeAssignee: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        taskId: z.string(),
        assigneeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Disconnect the assignee from the task and delete the task relationship
      return await ctx.prisma.task_Assign_Rel.delete({
        where: {
          task_id_user_id: {
            task_id: input.taskId,
            user_id: input.assigneeId,
          },
        },
      });
    }),
});
