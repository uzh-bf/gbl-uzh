# Central Bank

> [!NOTE]
> The detailed service terminology below is historical. The maintained game-building documentation is the [platform wiki](../../docs/index.md), and the current API pattern is [tRPC v11 on the Pages Router](../../docs/api-layer.md).

Central Bank is an example game built on `@gbl-uzh/platform`. It uses the same
typed tRPC router, NextAuth context, SuperJSON transport, and Server-Sent Events
pattern as `apps/demo-game` while supplying its own monetary-policy facts and
service computations.

## Getting started

### Authentication

All in-repo games use the platform's shared `resolveAdminOidcConfig()` resolver.
Starter, devrouter, and CI use mock OIDC through `GBL_AUTH_MODE=mock` and
`GBL_MOCK_OIDC_*`. Native host mode uses the same mock defaults from this
example's committed `.env.development` when the local OIDC service is reachable.

For a native host real-tenant run, copy `.env.local.template` to ignored
`.env.local`, keep `GBL_AUTH_MODE=auth0`, and fill the real `AUTH0_*` values.
Production defaults to real `AUTH0_*` and forbids mock mode. See
[`docs/developing-a-game.md`](../../docs/developing-a-game.md#authentication-and-local-development)
and [`docs/deploying-a-game.md`](../../docs/deploying-a-game.md).

### Local development

Use a devcontainer — everything (Postgres, mock OIDC login, install/build/seed, dev server) is automatic:

- **Starter configuration** (`.devcontainer/starter/`) — only Docker + VS Code with the Dev Containers extension; walkthrough in [`docs/getting-started.md`](../../docs/getting-started.md).
- **devrouter configuration** (`.devcontainer/`) — multi-project routing for maintainers; see [`.devcontainer/README.md`](../../.devcontainer/README.md).

If the environment misbehaves, use the `gbl-environment-doctor` skill (`.agents/skills/gbl-environment-doctor/`).

---

## Implementation

The game is composed of a backend running in a Docker container and a web app that generates the frontend. The database automatically adapts to the reducers `src/reducers`, which are a set of functions each of which are defined on a specific action. An action can be triggered by a user (or player) of the game or the admin who manages the game. For each object in the database a specific initiialize reducer initializes the object on the database. The developer therefore does not need to specify any database schemas manually.

The frontend is generated using React and Next.js. The frontend is located in the
`src/components` and `src/pages` folders, whereas actions are triggered with javascript calls. The actions in turn trigger the reducers on the backend.

### Terminology

- **Admin**: The person responsible for managing games, including creating new games and controlling the flow of running games.
- **Player**: Someone who joins and plays a game set up by the admin.
- **Period**: A game can have multiple periods, each of which consists of multiple Segments. The game state can be adjusted at the beginning and end of each period.
- **Segment**: The smallest unit of time in the game. The game state can be adjusted at the start and end of each segment, as well as when it is initialized.
- **Results**: The results of a period are the results of all segments in that period. The results of a segment are the results of all actions in that segment.
- **Facts**:

![alt text](timeline.svg)

## How to implement the database

### Schema

The shared database schema comes from the platform and is copied by
`prisma/copy.ts`. Game-specific facts and Yup schemas live in `src/types/`.
`src/server/trpc/router.ts` supplies those schemas and service modules to
`createPlatformRouter`; no GraphQL schema or client code generation is used.

### Reducers

Reducers are functions that are executed on the server in response to user interactions. These functions can alter the game state by defining different actions. Reducers can be divided into four types:

#### PeriodReducers

Period reducers are a set of functions that are executed for each status change of a period. These functions are defined in an ActionTypes enumeration inside _PeriodReducers.ts_ and include the following actions:

```javascript
export enum ActionTypes {
  PERIOD_INITIALIZE = 'PERIOD_INITIALIZE',
  PERIOD_CONSOLIDATE = 'PERIOD_CONSOLIDATE',
}
```

- _Period Initialize_ is called as soon as te _admin_ creates a new period in the admin interface.
- _Period Consolidate_ is called TODO

#### PerdiodResultReducer

The Period Result Reducers are a set of action which are called when the results of a period are changed.

```javascript
export enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}
```

- _Period Result Initialize_ is called as soon as a period is actually started.
- _Period Result Start_ TODO
- _Period Result End_ is called when the period is ended by the admin.

#### SegmentReducers

```javascript
export enum ActionTypes {
  SEGMENT_INITIALIZE = 'SEGMENT_INITIALIZE',
}
```

- _Segment Initialize_ is called as soon as a new segmenet is created by the _admin_ of the game.

#### ActionReducers

Are called each time an action is performed by an user. Lets say we program a chess app then we have an action called _move_ which is called each time a user moves a piece. While the other reducers are identical for each game, the action reducers are different for each game.

`````javascript

````javascript
export enum ActionTypes {
  ACTION_MOVE = 'ACTION_MOVE',
}
`````

- _Action Move_ is called each time a user moves a piece in a chess game.
