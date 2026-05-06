import { EventEmitter, on } from "node:events";
import type { Event as PlatformEvent } from "../types.js";

const GLOBAL_EVENT_CHANNEL = "global:events";
const USER_EVENT_CHANNEL = "user:events";

const eventBus = new EventEmitter();

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function publishGlobalNotificationRealtime(
  event: PlatformEvent<string>
): void {
  eventBus.emit(GLOBAL_EVENT_CHANNEL, event);
}

export function publishUserNotificationRealtime(
  userId: string,
  events: PlatformEvent<string>[]
): void {
  if (!events.length) return;

  eventBus.emit(USER_EVENT_CHANNEL, userId, events);
}

export function subscribeToGlobalEvents(
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>> {
  const iterator = on(
    eventBus,
    GLOBAL_EVENT_CHANNEL,
    signal ? { signal } : undefined
  );

  return (async function* () {
    try {
      for await (const [event] of iterator) {
        yield event as PlatformEvent<string>;
      }
    } catch (error) {
      if (!isAbortError(error)) throw error;
    }
  })();
}

export function subscribeToUserEvents(
  userId: string,
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>[]> {
  const iterator = on(
    eventBus,
    USER_EVENT_CHANNEL,
    signal ? { signal } : undefined
  );

  return (async function* () {
    try {
      for await (const [publishedUserId, events] of iterator) {
        const payloadEvents = events as PlatformEvent<string>[];
        if (publishedUserId !== userId) continue;
        yield payloadEvents;
      }
    } catch (error) {
      if (!isAbortError(error)) throw error;
    }
  })();
}
