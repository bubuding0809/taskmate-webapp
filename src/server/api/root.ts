/* DONE BY: Ding RuoQian 2100971 */

import { createTRPCRouter } from "./trpc";
import {
  boardRouter,
  folderRouter,
  panelRouter,
  userRouter,
  taskRouter,
  collaboratorRouter,
} from "./routers/";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  folder: folderRouter,
  board: boardRouter,
  panel: panelRouter,
  task: taskRouter,
  collaborator: collaboratorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
