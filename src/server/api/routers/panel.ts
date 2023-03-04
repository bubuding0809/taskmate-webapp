import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const PANEL_ORDER_STEP = 100;

export const panelRouter = createTRPCRouter({
  // Mutation to create a new panel
  createPanel: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        boardId: z.string(),
        panelId: z.string(),
        prevPanelOrder: z.number(),
        title: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.panel.create({
        data: {
          Board: {
            connect: {
              id: input.boardId,
            },
          },
          order: input.prevPanelOrder + PANEL_ORDER_STEP,
          panel_title: input.title ?? null,
          panel_color: input.color ?? null,
        },
      });
    }),

  // Mutation to delete a panel
  deletePanel: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.panel.delete({
        where: {
          id: input.panelId,
        },
      });
    }),

  // Mutation to update a panel's order
  updatePanelOrder: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // if board order reaches 0, push all panel orders down by 100
      return await ctx.prisma.$transaction(async (tx) => {
        // Check if new order is already taken
        const panelWithOrder = await ctx.prisma.panel.findFirst({
          where: {
            board_id: input.boardId,
            order: input.order,
          },
        });

        // if board order reaches 0 or if input.order is already taken, then increment all panels' order
        if (input.order === 0 || panelWithOrder) {
          await tx.panel.updateMany({
            where: {
              board_id: input.boardId,
            },
            data: {
              order: {
                increment: PANEL_ORDER_STEP,
              },
            },
          });

          return await tx.panel.update({
            where: {
              id: input.panelId,
            },
            data: {
              order: panelWithOrder ? input.order : PANEL_ORDER_STEP / 2,
            },
          });
        }

        // Else update the panel order to the new order
        return await ctx.prisma.panel.update({
          where: {
            id: input.panelId,
          },
          data: {
            order: input.order,
          },
        });
      });
    }),

  // Mutation to update a panel's title
  updatePanelTitle: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        panelId: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.panel.update({
        where: {
          id: input.panelId,
        },
        data: {
          panel_title: input.title,
        },
      });
    }),
});
