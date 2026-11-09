---
type: Architecture Decision Record
title: Identify browser enrollment and protect return links
status: accepted
description: Make registration retries resume one player while preserving private-link recovery and credential isolation.
tags:
  - registration
  - authentication
  - recovery
timestamp: "2026-10-27T00:00:00Z"
---

# Identify browser enrollment and protect return links

A lost response or repeat visit must not create another player. Participants also need a way back into their player entry after changing browsers or losing cookies. The shared invitation cannot serve as that private credential because everyone receives it.

Establish a random HttpOnly enrollment cookie before final submission. Persist a per-game SHA-256 digest as `Player.enrollmentKey`, with a unique constraint on `(gameId, enrollmentKey)`. The cookie currently lasts 30 days and uses SameSite=Lax and Secure on HTTPS.

A retry resumes the existing player without changing its profile or consuming another slot. Resume checks run before closed/full checks, so existing players can return after registration closes or the game starts. An authenticated player in the same game can also resume through its current session.

Keep `/join/[token]` as the private login and recovery link. Successful registration or resume issues the existing player-session cookie. Players can copy their return link from the Team panel; authorized administrators can provide another copy. Public registration responses contain only join information, and co-player views do not disclose another player's credentials.

## Considered Options

- Create a player on every submission: duplicates entries when requests are retried or responses are lost.
- Use the bank name as identity: names can collide or change and do not prove ownership.
- Require participant accounts: adds sign-in and account-management steps to the classroom flow.
- Use the shared invitation as the return credential: cannot distinguish participants and would expose access to existing players.

## Consequences

This identifies a browser enrollment, not a human. People sharing one browser profile can resume the same entry; changing browsers can create another entry unless the participant uses the private return link. Capacity limits entries, not verified people.

Anyone holding a private return link can access that player. Keep it out of public responses and other players' views. Losing both browser identity/session and the saved link requires administrator-assisted recovery. Closing registration blocks new enrollment, not access to an existing entry.

## References

- [Shared registration decision](0003-support-shared-game-registration.md) and [API layer](../api-layer.md).
- `packages/platform/src/services/RegistrationService.ts:prepareRegistration`, `registerPlayer`, and `resumeRegistration`.
- `packages/platform/public/schema.prisma:Player`.
- `packages/platform/src/services/AccountService.ts:loginAsTeam` and `packages/platform/src/types/Player.ts:Player`.
- `apps/demo-game/src/components/team/ReturnLink.tsx:ReturnLink`.
