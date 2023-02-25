import { Board, Folder } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const folderRouter = createTRPCRouter({
  // Query to get all folders for a user
  getAllUserFolders: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const folders = await ctx.prisma.folder.findMany({
        where: {
          user_id: input.userId,
        },
        include: {
          boards: true,
        },
      });

      const folderOrder = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          folder_order: true,
        },
      });

      // Create a map of folder id to folder
      const folderMap = new Map<string, Folder & { boards: Board[] }>(
        folders.map((folder) => [folder.id, folder])
      );

      return {
        folders: folderMap,
        folderOrder: folderOrder!.folder_order?.split(",") || [],
      };
    }),

  // Query to get a single folder
  getFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.folder.findUnique({
        where: {
          id: input.folderId,
        },
        include: {
          boards: true,
        },
      });
    }),

  // Mutation to create a new folder
  createFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        name: z.string(),
        userId: z.string(),
        currentFolderOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newFolder = await ctx.prisma.folder.create({
        data: {
          id: input.folderId,
          folder_name: input.name,
          thumbnail_image: "📂",
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });

      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          folder_order: input.currentFolderOrder
            .concat([newFolder.id])
            .join(","),
        },
      });

      return newFolder;
    }),

  // Mutation to delete a folder
  deleteFolder: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        userId: z.string(),
        folderOrder: z.array(z.string()),
        boardOrder: z.array(z.string()),
        boardIdsToBeUpdated: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Use an interactive transaction to ensure that all operations are completed
      return await ctx.prisma.$transaction(async (tx) => {
        // Get all boards in the folder, these boards will be moved to the unorganized section
        const boardIdsToBeUpdated = await tx.board.findMany({
          where: {
            folder_id: input.folderId,
          },
          select: {
            id: true,
          },
        });

        // Set all folder property of the boards in the folder to null
        await tx.board.updateMany({
          where: {
            folder_id: input.folderId,
          },
          data: {
            folder_id: null,
          },
        });

        // filder out the folder from the user's folder order
        const newFolderOrder = input.folderOrder
          .filter((folderId) => folderId !== input.folderId)
          .join(",");

        // Update the user's folder order and board order
        await tx.user.update({
          where: {
            id: input.userId,
          },
          data: {
            folder_order: newFolderOrder.length > 0 ? newFolderOrder : null,
            board_order:
              boardIdsToBeUpdated.length > 0
                ? [
                    ...input.boardOrder,
                    boardIdsToBeUpdated.map((item) => item.id),
                  ].join(",")
                : [...input.boardOrder].join(","),
          },
        });

        // Delete the folder
        return await tx.folder.delete({
          where: {
            id: input.folderId,
          },
        });
      });
    }),

  // Mutation to rename a folder
  renameFolder: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        folderId: z.string(),
        newName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.folder.update({
        where: {
          id: input.folderId,
        },
        data: {
          folder_name: input.newName,
        },
      });
    }),

  // Mutation to update the folder order
  updateFolderOrder: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        folderOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          folder_order: input.folderOrder.join(","),
        },
      });
    }),
});
