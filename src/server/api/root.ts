import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { folderRouter } from "./routers/folder";
import { boardRouter } from "./routers/board";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  folder: folderRouter,
  board: boardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
