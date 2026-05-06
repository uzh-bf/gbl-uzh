import { playerProcedure, createTRPCRouter } from "../init.js";
import {
  subscribeToGlobalEvents,
  subscribeToUserEvents,
} from "../../lib/realtime.js";

export function createEventsRouter() {
  return createTRPCRouter({
    global: playerProcedure.subscription(({ signal }) =>
      subscribeToGlobalEvents(signal)
    ),
    user: playerProcedure.subscription(({ ctx, signal }) =>
      subscribeToUserEvents(ctx.user.sub, signal)
    ),
  });
}
