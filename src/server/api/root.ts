import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { namePronunciationEntryRouter } from "./routers/namePronunciationEntry";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  namePronunciationEntry: namePronunciationEntryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
