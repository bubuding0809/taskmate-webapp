import { Board } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const boardRouter = createTRPCRouter({
  // Query to get all boards that are not in a folder for a user, and the order of the boards
  // This is used to populate the sidebar with unorganized boards
  getUserBoardWithoutFolder: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const boards = await ctx.prisma.board.findMany({
        where: {
          user_id: input.userId,
          folder_id: null,
        },
      });

      const boardOrder = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          board_order: true,
        },
      });

      // create a map of board id to board
      const boardMap = new Map<string, Board>(
        boards.map((board) => [board.id, board])
      );

      return {
        boards: boardMap,
        boardOrder: boardOrder!.board_order?.split(",") || [],
      };
    }),

  // Mutation to add a board to a folder, and update the board order
  // This is used when a user drags a board into a folder in the sidebar
  addBoardToFolder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        folderId: z.string(),
        userId: z.string(),
        boardOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Update board to have folder_id
      const board = await ctx.prisma.board.update({
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

      // Update user's board_order
      const user = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          board_order:
            input.boardOrder.length > 0 ? input.boardOrder.join(",") : null,
        },
        select: {
          board_order: true,
        },
      });

      return {
        board,
        boardOrder: user.board_order?.split(",") || [],
      };
    }),

  // Mutation to update a board's order in the unorganized boards section of the sidebar
  // This is used when a user drags a board in the unorganized boards section of the sidebar
  updateBoardOrder: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        boardOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Update user's board_order
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          board_order: input.boardOrder.join(","),
        },
      });
    }),
});
