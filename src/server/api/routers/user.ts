/* DONE BY: Ding RuoQian 2100971 */
/* DONE BY: Amri Sazali 2102350 */

import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAllUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getUsersByNameOrEmail: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: input.query,
              },
            },
            {
              email: {
                contains: input.query,
              },
            },
          ],
        },
      });
    }),

  getUserStats: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      return await ctx.prisma.$transaction(async (tx) => {
        const folders = await tx.folder.findMany({
          where: {
            user_id: userId,
          },
        });

        const boards = await tx.board.findMany({
          where: {
            user_id: userId,
          },
        });

        const panels = await tx.panel.findMany({
          where: {
            Board: {
              user_id: userId,
            },
          },
        });

        const tasks = await tx.task.findMany({
          where: {
            Panel: {
              Board: {
                user_id: userId,
              },
            },
          },
        });

        return {
          folders: folders.length,
          boards: boards.length,
          panels: panels.length,
          tasks: tasks.length,
        };
      });
    }),
});
