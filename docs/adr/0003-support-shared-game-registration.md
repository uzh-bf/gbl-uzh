---
type: Architecture Decision Record
title: Support shared game registration
status: accepted
description: Keep enrollment method separate from availability while supporting shared links and fixed-count games.
tags:
  - registration
  - game-model
timestamp: "2026-10-27T00:00:00Z"
---

# Support shared game registration

Admins need to invite a class without knowing the final player count or distributing individual links. A shared invitation must create separate player entries; it must not log everyone into the same player.

Keep two enrollment methods in `Game.registrationMode`: `FIXED` creates players up front, and `SHARED_LINK` creates a player only after completed setup is submitted. The admin UI defaults to `SHARED_LINK`; existing games and API callers that omit the mode retain `FIXED` behavior.

Keep `registrationOpen` separate from the mode. A shared-link game remains a shared-link game when the instructor closes registration. The owner or a master can close and reopen registration while the game is `SCHEDULED`. New enrollment stops when the game starts. Optional `maxPlayers` limits capacity; null means unlimited.

Participants use `/join/game/[token]` and the existing introduction → bank setup → review flow. Server validation must succeed before a player is created. The QR code encodes exactly the shared URL shown in the admin copy control.

## Considered Options

- Keep fixed-count creation only: requires knowing attendance and distributing individual invitations before play.
- Share one private player link: gives everyone access to the same player rather than creating separate entries.
- Derive availability solely from the mode or game status: cannot express an instructor closing registration before start.
- Use one enum with `FIXED`, `SHARED_LINK_OPEN`, and `SHARED_LINK_CLOSED`: combines the enrollment method with a temporary state. Separate fields keep their responsibilities explicit.

## Consequences

The mode is named `SHARED_LINK`, not `OPEN`, to avoid confusing enrollment method with availability. `registrationOpen = true` alone does not guarantee admission: the game must still be scheduled and have capacity.

Fixed-count creation and private links remain compatible. One additive migration creates the final enum and registration fields; existing rows receive fixed-mode defaults. Apply it before deploying application code that reads the new fields.

## References

- [Game model](../game-model.md) and [registration glossary](../glossary.md).
- `packages/platform/public/schema.prisma:RegistrationMode` and `Game`.
- `packages/platform/src/services/GameService.ts:createGame`.
- `packages/platform/src/services/RegistrationService.ts:registrationInfo`, `registerPlayer`, and `setRegistrationOpen`.
- `apps/demo-game/src/components/admin/RegistrationPanel.tsx:RegistrationPanel`.
- [Identity and recovery decision](0004-identify-browser-enrollment-and-protect-return-links.md).
