import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const boardRouter = createTRPCRouter({
  getUserBoardWithoutFolder: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.board.findMany({
        where: {
          user_id: input.userId,
          folder_id: null,
        },
      });
    }),

  addBoardToFolder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        folderId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Update board to have folder_id
      return await ctx.prisma.board.update({
        where: {
          id: input.boardId,
        },
        data: {
          folder: {
            connect: {
              id: input.folderId,
            },
          },
        },
      });
    }),
});
