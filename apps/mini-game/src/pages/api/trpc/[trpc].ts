import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "~/server/api/root";
import { env, createTRPCContext } from "@gbl-uzh/platform2";
import { prisma } from "~/server/db";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext(prisma),
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
