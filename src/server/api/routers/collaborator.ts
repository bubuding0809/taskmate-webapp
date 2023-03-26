import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const collaboratorRouter = createTRPCRouter({
  // Mutation to add collaborators to a board
  addCollaborators: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { boardId, userIds } = input;

      const addCollaborators = userIds.map((id) => ({
        board_id: boardId,
        user_id: id,
      }));

      return await ctx.prisma.board_Collaborator.createMany({
        data: addCollaborators,
      });
    }),

  // Mutation to remove collaborators from a board
  removeCollaborators: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { boardId, userIds } = input;

      return await ctx.prisma.board_Collaborator.deleteMany({
        where: {
          board_id: boardId,
          user_id: {
            in: userIds,
          },
        },
      });
    }),
});
