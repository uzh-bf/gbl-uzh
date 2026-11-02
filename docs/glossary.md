---
type: Glossary
title: Registration Glossary
description: Shared terms for enrollment, player identity, availability, and the starting roster.
tags:
  - registration
  - domain-model
timestamp: "2026-10-27T00:00:00Z"
---

# Registration Glossary

These terms describe the shared-registration decisions in [ADR-0003](adr/0003-support-shared-game-registration.md), [ADR-0004](adr/0004-identify-browser-enrollment-and-protect-return-links.md), and [ADR-0005](adr/0005-serialize-enrollment-with-initial-game-start.md).

| Term                               | Meaning in this platform                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game                               | A session with one shared lifecycle, roster, and configured periods and segments.                                                                                                                        |
| Player / bank / team               | One `Player` entry within a game. The demo UI calls it a bank; platform code also uses team. It is not an administrator account or a verified human identity.                                            |
| Registration / enrollment          | Creating a player after completed setup is submitted through the shared invitation. Viewing the invitation or editing the draft does not create an entry.                                                |
| Registration mode                  | The enrollment method: `FIXED` pre-creates a specified player count; `SHARED_LINK` creates entries as participants complete registration.                                                                |
| Registration open                  | The instructor-controlled `registrationOpen` flag, separate from the mode. It can be toggled for a shared-link game while scheduled.                                                                     |
| Registration availability          | The effective admission result: `CLOSED` when registration is disabled or the game has started; otherwise `FULL` when capacity is reached; otherwise `OPEN`. This is not a registration-mode enum value. |
| Capacity                           | Optional `maxPlayers`, limiting the number of player entries. Null means unlimited.                                                                                                                      |
| Shared registration link / QR code | The invitation at `/join/game/[token]`, identified by `Game.registrationToken`. The QR encodes the same URL. Possessing it does not grant access to another player's entry.                              |
| Browser enrollment identity        | A random HttpOnly cookie used to recognize repeat enrollment from a browser profile. It is distinct from the authenticated player session.                                                               |
| Enrollment key                     | The per-game digest of the browser identity, stored as `Player.enrollmentKey`; uniqueness with `gameId` prevents duplicate entries for that identity.                                                    |
| Private return link                | `/join/[token]`, using `Player.token` to sign into an existing player. It is a bearer credential and can be used on another browser or device.                                                           |
| Resume                             | Recover the existing player session without creating another entry or changing its profile. Closure and capacity do not block recognized players from resuming.                                          |
| Starting roster                    | The accepted players read inside the initial start transaction; each receives starting results and associated initialization actions.                                                                    |
| Pending setup event                | `Player.setupEventPending` records completed registration whose setup rewards will be processed when period zero starts.                                                                                 |

Source: `packages/platform/public/schema.prisma`, `packages/platform/src/services/RegistrationService.ts:registrationInfo`, `registerPlayer`, and `resumeRegistration`; see [Game model](game-model.md) and [Game lifecycle](game-lifecycle.md) for the full contracts.
