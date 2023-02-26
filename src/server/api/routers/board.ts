import { Board } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const boardRouter = createTRPCRouter({
  // Query to get board by id
  getBoardById: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.board.findUnique({
        where: {
          id: input.boardId,
        },
      });
    }),

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

  // Mutation to create a new board
  createBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string(),
        userId: z.string(),
        currentBoardOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // Create a new board and connect it to the user
        const newBoard = await tx.board.create({
          data: {
            user: {
              connect: {
                id: input.userId,
              },
            },
            id: input.boardId,
            board_title: input.title,
            thumbnail_image: "📝",
          },
        });

        // Add the board to the unorganized boards order
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            board_order: [...input.currentBoardOrder, newBoard.id].join(","),
          },
        });

        return newBoard;
      });

      // Update user's board_order
    }),

  // Mutation to delete a board
  deleteBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userId: z.string(),
        folderId: z.string().nullable(),
        rootBoardOrder: z.array(z.string()).nullable(),
        folderBoardOrder: z.array(z.string()).nullable(),
        isOrganized: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // Update the user's board order if the board was in the unorganized boards
        if (!input.isOrganized) {
          // Filter out the board from the user's board order
          const newRootBoardOrder = input
            .rootBoardOrder!.filter((boardId) => boardId !== input.boardId)
            .join(",");

          await tx.user.update({
            where: {
              id: input.userId,
            },
            data: {
              board_order:
                newRootBoardOrder.length > 0 ? newRootBoardOrder : null,
            },
          });
        } else {
          // Update the folder's board order if the board was in a folder
          const newFolderBoardOrder = input
            .folderBoardOrder!.filter((boardId) => boardId !== input.boardId)
            .join(",");

          await tx.folder.update({
            where: {
              id: input.folderId!,
            },
            data: {
              board_order:
                newFolderBoardOrder.length > 0 ? newFolderBoardOrder : null,
            },
          });
        }

        // Finally delete the board
        return await tx.board.delete({
          where: {
            id: input.boardId,
          },
        });
      });
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
        folderBoardOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
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

        // Update the folder's board order
        const folder = await ctx.prisma.folder.update({
          where: {
            id: input.folderId,
          },
          data: {
            board_order: [...input.folderBoardOrder, board.id].join(","),
          },
        });

        return {
          board,
          folder,
          boardOrder: user.board_order?.split(",") || [],
        };
      });
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

  // Mutation to rename a board
  renameBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string(),
        userId: z.string(),
        isOrganized: z.boolean(),
        folderId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.board.update({
        where: {
          id: input.boardId,
        },
        data: {
          board_title: input.title,
        },
      });
    }),

  // Mutation to remove a board from a folder
  // This is used when the user presses the remove from folder option in the board menu
  removeBoardFromFolder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        folderId: z.string(),
        userId: z.string(),
        rootBoardOrder: z.array(z.string()),
        folderBoardOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // Update board to remove folder_id
        const board = await tx.board.update({
          where: {
            id: input.boardId,
          },
          data: {
            folder: {
              disconnect: true,
            },
          },
        });

        // Update user's board_order
        const user = await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            board_order: [...input.rootBoardOrder, board.id].join(","),
          },
          select: {
            board_order: true,
          },
        });

        // Update the folder's board order
        const newFolderBoardOrder = input.folderBoardOrder.filter(
          (boardId) => boardId !== input.boardId
        );
        const folder = await tx.folder.update({
          where: {
            id: input.folderId,
          },
          data: {
            board_order:
              newFolderBoardOrder.length > 0
                ? newFolderBoardOrder.join(",")
                : null,
          },
        });

        return {
          board,
          folder,
          boardOrder: user.board_order?.split(",") || [],
        };
      });
    }),
});
