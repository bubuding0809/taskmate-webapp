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

  getProtectedFolders: protectedProcedure.query(() => {
    return "Protected folders yet to be implemented";
  }),
});
