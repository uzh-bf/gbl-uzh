---
status: accepted
---

# Keep production admin authentication fail-closed

The platform exports one admin OIDC resolver that defaults production to the real `AUTH0_*` provider and rejects mock authentication in production. Demo-game adopts this shared policy so a local ignored environment file cannot silently select a real tenant, while existing example games retain their legacy provider wiring in this PR to avoid widening a demo-only native-development package.

## Considered Options

- Keep direct environment reads in every game: rejected because production safety and local provider selection would drift between copied apps.
- Migrate every example in PR #185: rejected because native host mode remains demo-only and the additional consumers require a separate coherent migration.

## Consequences

The exported resolver is a public scaffold contract. Local devcontainers and CI must temporarily provide both the new mock namespace for demo-game and fake legacy `AUTH0_*` aliases for unchanged example games; production remains Auth0-only.
