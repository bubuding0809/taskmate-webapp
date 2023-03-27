import type {
  Attachment,
  Board,
  Panel,
  Task,
  Task_Activity,
  Task_Assign_Rel,
  User,
} from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { BoardDetailed } from "./folder";

export type TaskDetailed = Task & {
  Attachment: Attachment[];
  Task_Activity: Task_Activity[];
  subtasks: Task[];
};

export type TaskWithAssignees = Task & {
  Task_Assign_Rel: (Task_Assign_Rel & {
    User: User;
  })[];
};

export type TaskWithSubtasks = TaskWithAssignees & {
  subtasks: TaskWithAssignees[];
};

export type PanelWithTasks = Panel & {
  Task: TaskWithSubtasks[];
};

export type BoardWithPanelsAndTasks = Board & {
  Panel: PanelWithTasks[];
};

export type BoardWithPanelsAndTasksAndCollaborators = Board & {
  Panel: PanelWithTasks[];
  Board_Collaborator: {
    User: User;
  };
};

export const boardRouter = createTRPCRouter({
  // Query to get board by id
  getBoardById: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.board.findUnique({
        where: {
          id: input.boardId,
        },
        include: {
          Panel: {
            include: {
              Task: {
                include: {
                  subtasks: {
                    include: {
                      Task_Assign_Rel: {
                        include: {
                          User: true,
                        },
                      },
                    },
                    orderBy: {
                      order: "asc",
                    },
                  },
                  Task_Assign_Rel: {
                    include: {
                      User: true,
                    },
                  },
                },
                orderBy: {
                  order: "asc",
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
          Board_Collaborator: {
            include: {
              User: true,
            },
          },
          user: true,
        },
      });
    }),

  // Query to get a map of boards by id
  getUserBoardMap: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const boards = await ctx.prisma.board.findMany({
        where: {
          user_id: input.userId,
        },
      });

      const boardMap = new Map<string, Board>(
        boards.map((board) => [board.id, board])
      );

      return boardMap;
    }),

  // Query to get a map of tasks by id
  getTasksMapByBoardId: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const boardData = await ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        select: {
          Panel: {
            select: {
              Task: {
                include: {
                  subtasks: {
                    orderBy: {
                      order: "asc",
                    },
                  },
                  Attachment: true,
                  Task_Activity: true,
                },
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

      const tasksMap = new Map<string, TaskDetailed>();
      boardData?.Panel.forEach((panel) => {
        panel.Task.forEach((task) => {
          tasksMap.set(task.id, task);
        });
      });

      return tasksMap;
    }),

  // Query to get all boards that are not in a folder for a user, and the order of the boards
  // This is used to populate the sidebar with unorganized boards
  getUserBoardWithoutFolder: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const boards = await tx.board.findMany({
          where: {
            user_id: input.userId,
            folder_id: null,
          },
          include: {
            user: true,
            Board_Collaborator: {
              include: {
                User: true,
              },
            },
            Board_Message: true,
            Board_Tag: true,
            Team_Board_Rel: {
              include: {
                Team: true,
              },
            },
          },
        });

        const boardOrder = await tx.user.findUnique({
          where: {
            id: input.userId,
          },
          select: {
            board_order: true,
          },
        });

        // create a map of board id to board
        const boardMap = new Map<string, BoardDetailed>(
          boards.map((board) => [board.id, board])
        );

        return {
          boards: boardMap,
          boardOrder: boardOrder!.board_order?.split(",") || [],
        };
      });
    }),

  // Query to get all boards that user is a collaborator of
  getUserCollaboratorBoards: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const boards = await tx.board.findMany({
          where: {
            Board_Collaborator: {
              some: {
                user_id: input.userId,
              },
            },
          },
          include: {
            user: true,
            Board_Collaborator: {
              include: {
                User: true,
              },
            },
            Board_Message: true,
            Board_Tag: true,
            Team_Board_Rel: {
              include: {
                Team: true,
              },
            },
          },
        });

        // create a map of board id to board
        const boardMap = new Map<string, BoardDetailed>(
          boards.map((board) => [board.id, board])
        );

        return boardMap;
      });
    }),

  // Mutation to create a new board
  createBoard: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        boardId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        collaborators: z.array(z.string()).optional(),
        privacy: z.enum(["PRIVATE", "PUBLIC", "TEAM"]).optional(),
        currentBoardOrder: z.array(z.string()),
        folderId: z.string().optional(),
        folderBoardOrder: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const collaboratorCreate =
          input.collaborators?.map((collaboratorId) => ({
            user_id: collaboratorId,
          })) ?? [];

        // Create a new board and connect it to the user and folder
        if (input.folderBoardOrder && input.folderId) {
          const newBoard = await tx.board.create({
            data: {
              user: {
                connect: {
                  id: input.userId,
                },
              },
              folder: {
                connect: {
                  id: input.folderId,
                },
              },
              id: input.boardId,
              board_title: input.title,
              thumbnail_image: "📝",
              board_description: input.description ?? null,
              visibility: input.privacy ?? "PRIVATE",
              Board_Collaborator: {
                createMany: {
                  data: collaboratorCreate,
                },
              },
            },
          });

          // Add the board to the folder's board order
          await tx.folder.update({
            where: {
              id: input.folderId,
            },
            data: {
              board_order: [...input.folderBoardOrder, newBoard.id].join(","),
            },
          });

          return newBoard;
        }

        // Create a new board and connect it to the user without a folder
        else {
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
              board_description: input.description ?? null,
              visibility: input.privacy ?? "PRIVATE",
              Board_Collaborator: {
                createMany: {
                  data: collaboratorCreate,
                },
              },
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
        }
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

  // Mutation to update a board's order in a folder
  // This is used when a user drags a board in a folder in the sidebar to a new position
  // This can be from one folder to another or within the same folder
  updateFolderBoardOrder: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        boardId: z.string(),
        sourceFolderId: z.string(),
        destinationFolderId: z.string(),
        sourceBoardOrder: z.array(z.string()),
        destinationBoardOrder: z.array(z.string()),
        isSameFolder: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        // Update the source folder's board order
        const sourceFolder = await tx.folder.update({
          where: {
            id: input.sourceFolderId,
          },
          data: {
            board_order:
              input.sourceBoardOrder.length > 0
                ? input.sourceBoardOrder.join(",")
                : null,
          },
        });

        // Update the destination folder's board order if the board is being moved to a different folder
        let destinationFolder;
        if (!input.isSameFolder) {
          destinationFolder = await tx.folder.update({
            where: {
              id: input.destinationFolderId,
            },
            data: {
              board_order:
                input.destinationBoardOrder.length > 0
                  ? input.destinationBoardOrder.join(",")
                  : null,
            },
          });
        }

        // Update the board's folder_id
        const board = await tx.board.update({
          where: {
            id: input.boardId,
          },
          data: {
            folder: {
              connect: {
                id: input.destinationFolderId,
              },
            },
          },
        });

        return {
          sourceFolder,
          destinationFolder,
          board,
        };
      });
    }),
});
