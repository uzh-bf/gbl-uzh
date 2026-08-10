# tRPC and GraphQL Reference Audit

Date: 2026-08-10

Scope: current code, manifests, workflows, documentation, plans, fixtures, and
third-party content after migrating demo-game, Rate Wars, and Central Bank to
tRPC v11.

## Current contract

- All three repository games host `/api/trpc` and use the canonical Pages
  Router client documented in `docs/api-layer.md`.
- No repository game has an active Apollo provider, Nexus schema, GraphQL API
  route, generated GraphQL client, or GraphQL code-generation command.
- Published GraphQL package exports are retained and deprecated under ADR 0001;
  they are not the supported game-building path.

## Retained match classification

| Category                         | Retained scope                                                                                                                                                      | Reason                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Published platform compatibility | `packages/platform/src/nexus.ts`, `src/types/**` Nexus definitions, `src/lib/apollo.ts`, `SSELink.ts`, `pubsub.ts`, `public/ops/**`, and their package dependencies | Existing external import paths remain available until consumer confirmation permits a breaking removal |
| Published UI compatibility       | `packages/ui/src/hooks/useLearningActivities.ts`, Apollo peer/development dependency, and package fixture dependency                                                | The package root still exports the deprecated hook                                                     |
| Compatibility verification       | Platform and UI verifier scripts, fixtures, README text, and release workflow metadata                                                                              | Proves the supported package path and records why compatibility peers remain                           |
| Historical record                | `project/**`, changelog entries, and older documentation log entries                                                                                                | Preserves the sequence and evidence of the migration; dated outcome notes identify the current state   |
| Third-party content              | Escapp CKEditor samples and their package metadata                                                                                                                  | Vendored/example upstream content outside the GBL game API                                             |

## Active-code checks

The following searches must have no matches in the three game codebases and
their active manifests except prose that explicitly says an old surface is not
used:

```bash
rg -n "@apollo/client|graphql-yoga|graphql-sse|graphql-codegen|/api/graphql|src/graphql/generated" \
  apps/demo-game examples/rate-wars examples/central-bank

rg -n "build:nexus|generate:graphql|graphql-codegen|nodemon.*graphql" \
  package.json apps/demo-game/package.json examples/rate-wars/package.json \
  examples/central-bank/package.json
```

The broader repository search is reviewed by category rather than expected to
be empty:

```bash
rg -n "@apollo/client|graphql-yoga|graphql-sse|graphql-codegen|/api/graphql|build:nexus" \
  apps examples packages .github docs project package.json pnpm-lock.yaml
```

## Removal gate

Do not delete the published compatibility scopes until the external-consumer
condition in `docs/adr/0001-deprecate-graphql-compatibility.md` is met. At that
point, repeat this inventory, remove only confirmed-obsolete exports and peers,
and rerun both packed clean-consumer verifiers.
