# @gbl-uzh/ui

Shared React components and orchestration hooks for learning games built on the GBL platform.

The package is ESM-only and pre-1.0. Pin a tested version and review release notes before upgrading.

## Install

```bash
pnpm add @gbl-uzh/ui
```

The game must declare compatible framework and shared-context peers, including Next.js, React, Apollo Client, React Hook Form, and the UZH design system. Use the versions accepted by this package's `peerDependencies`. Apollo remains required because the package root still exports a deprecated GraphQL learning hook; repository games do not use that hook.

`useLearningActivities` is retained only for published GraphQL compatibility
and is deprecated. New games keep a small app-local tRPC hook tied to their
`AppRouter` and use targeted `trpc.useUtils()` invalidation. React 19 consumers
that still use the compatibility hook should use Apollo Client 3.14.1 or newer;
that combination is covered by the strict external-consumer build.

## Use

```tsx
import { GameSidebar, Layout, StoryElements } from "@gbl-uzh/ui";
```

Import the utilities-only stylesheet once in the game's global CSS:

```css
@import "@gbl-uzh/ui/style.css";
```

App Router modules that import this hook-based bundle need a `'use client'` boundary. GBL reference games use the Pages Router.

The full component inventory and game integration guidance live in the [GBL platform wiki](https://github.com/uzh-bf/gbl-uzh/blob/dev/docs/ui-components.md).

## License

LGPL-3.0
