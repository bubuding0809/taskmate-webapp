/* DONE BY: Ding RuoQian 2100971 */

import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

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
});
