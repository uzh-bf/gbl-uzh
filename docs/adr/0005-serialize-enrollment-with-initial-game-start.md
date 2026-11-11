---
type: Architecture Decision Record
title: Serialize enrollment with initial game start
status: accepted
description: Commit registration, capacity checks, and the initial roster consistently before publishing notifications.
tags:
  - registration
  - concurrency
  - lifecycle
timestamp: "2026-11-11T00:00:00Z"
---

# Serialize enrollment with initial game start

Participants can submit simultaneously or while an instructor closes registration or starts the game. A capacity check followed by a separate insert can overfill a game. Reading the roster before a start transaction can accept a player without creating its starting results.

Use `RegistrationService.ts:withRegistrationLock` to run registration, registration controls, and the first `SCHEDULED → PREPARATION` transition in read-committed database transactions that first lock the game row (`SELECT … FOR UPDATE`). Roster changes of one game therefore run one after another, and each reads the roster committed before it. They also increment the game version for realtime clients. The unique game/enrollment-key constraint also enforces one entry per browser identity.

A whole class may join within the same second after scanning the QR code. The row lock queues joins to the same game. The transaction acquisition limit (`maxWait`) is 30 seconds; the separate execution limit (`timeout`) is 15 seconds and includes waiting for the row lock. The limits accommodate bursts but do not guarantee success at every load or database latency.

Initial start reads the current roster and period configuration inside its transaction. It requires at least one player and a configured first period, closes registration, initializes every accepted player's results and associated actions, and advances the game status atomically. A new join racing with start either commits first and receives complete starting results, or is rejected as closed. Failed initialization rolls back the start, including its registration change.

Publish registration and lifecycle notifications after commit. The existing admin subscription refetches on matching events and retains polling as a fallback.

## Considered Options

- Enforce capacity and closure only in the UI: clients can be stale, and simultaneous requests still race.
- Read the roster before the start transaction: a concurrent join can be accepted but omitted from initialization.
- Add results for late entrants after start: expands lifecycle semantics and permits temporarily incomplete players. Late enrollment is outside this feature's scope.
- Serialize operations only in application memory: does not coordinate multiple server processes.
- Serializable isolation with bounded conflict retries (the first implementation): every join writes the same game row, so simultaneous joins abort each other. In a local load test, more than half of 300 simultaneous joins exhausted five retries and failed.

## Consequences

Joins to the same game queue on its row lock rather than competing through serializable snapshots; 500 simultaneous joins completed in a local load test. The database integration suite exercises bursts of 100, 300, and 500 registrations, checking exact counts and sequential player numbers. It forces both join/start orderings using barriers around real database queries and verifies shared/exclusive lock compatibility and release after commit or rollback. These are service-level concurrency checks, not browser or production capacity benchmarks. A deadlock or serialization error still retries a few times. The enrollment identity makes client retries safe even when the original request committed but its response was lost.

Setup achievements require a period relation, but registration may happen before periods exist. Initial start therefore processes the setup event of every player who enrolled through the shared link (`Player.enrollmentKey` is set) using period zero, in the same transaction; reward notifications are also deferred until commit. Profile edits recognize registered players as already set up.

The registration transaction policy applies only to initial start, not later lifecycle transitions. Later transitions keep their existing `Segment.validateAdvance` checks and dice-reveal requirements; the transitions that end a running segment take `GameTransaction.ts:lockGameForUpdate` so that in-flight player actions holding `lockGameForShare` finish first (see [Game Model](../game-model.md)).

## References

- [Game lifecycle](../game-lifecycle.md) and [identity and recovery decision](0004-identify-browser-enrollment-and-protect-return-links.md).
- `packages/platform/src/services/RegistrationService.ts:withRegistrationLock` and `registrationTransaction`.
- `packages/platform/src/services/GameTransaction.ts:lockGameForUpdate` and `lockGameForShare` replace the removed `RegistrationService.lockGame` export; there is no deprecated adapter.
- `packages/platform/src/services/GameService.ts:activateNextPeriod` and `computePeriodStartResults`.
- `packages/platform/src/services/EventService.ts:receiveEvents`.
- `apps/demo-game/src/lib/gameEvents.ts:shouldRefetchAdminGame`.
- `apps/demo-game/src/services/RegistrationService.integration.test.ts` covers capacity, closure, retries, join/start races, rollback, and bursts of simultaneous joins.
