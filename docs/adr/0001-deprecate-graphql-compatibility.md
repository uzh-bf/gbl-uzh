---
type: Architecture Decision Record
title: Deprecate Published GraphQL Compatibility
description: Keep published GraphQL exports temporarily while tRPC v11 becomes the only supported game API.
tags:
  - api
  - graphql
  - trpc
  - compatibility
timestamp: "2026-08-10T00:00:00Z"
---

# ADR 0001: Deprecate Published GraphQL Compatibility

Status: accepted

Date: 2026-08-10

## Context

Demo-game, Rate Wars, and Central Bank now use tRPC v11 for every repository
query, mutation, and subscription. The published `@gbl-uzh/platform` package
still exposes Nexus, Apollo, GraphQL SSE, pubsub, and operation-file subpaths;
the published `@gbl-uzh/ui` root still exports an Apollo-backed learning hook.
Removing those exports without evidence about external consumers would be a
breaking package change.

## Decision

- tRPC v11 on the Next.js Pages Router is the only supported API for repository
  games and new external games.
- Keep the published platform GraphQL modules and UI Apollo-backed hook, mark
  them deprecated in source and package documentation, and do not use them in
  repository game code.
- Make the platform's GraphQL peer dependencies optional so a clean tRPC-only
  platform consumer does not need to install the deprecated stack. Keep Apollo
  as a UI peer while the package root exports the compatibility hook.
- Verify releases from the exact packed platform artifact, including a clean
  consumer that imports and executes the supported tRPC surface without
  GraphQL packages.

## Removal condition

Remove the compatibility surface only after repository/package usage evidence
confirms that no supported external consumer imports it, and after the breaking
release or deprecation window is announced. The removal change must name each
deleted export and verify the supported tRPC consumer again.

## Consequences

Repository games have one current transport and one documented client pattern.
Published compatibility remains maintenance work and may constrain peer
metadata until removal. A GraphQL match is therefore not automatically a
defect: it is acceptable only in the classified compatibility source, its
fixture, historical records, or third-party content.

## Restoration path

Before removal, restoration means reverting deprecation metadata or optional
peer metadata while leaving tRPC as the default. After removal, restore the
last released compatibility modules into their previous package subpaths from
the final commit that contained them; do not route repository games back to
GraphQL or change the tRPC default.
