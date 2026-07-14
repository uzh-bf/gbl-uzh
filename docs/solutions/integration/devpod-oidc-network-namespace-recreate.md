---
module: devcontainer
date: 2026-07-14
problem_type: integration
severity: medium
symptoms:
  - "workspace ensure times out with HTTP route readiness timed out: oidc (502)"
  - "The OIDC container remains running but localhost:8090 disappears from the recreated app container"
  - "A repeated ensure recreates the app instead of reusing the healthy workspace"
root_cause: "The OIDC sidecar shared the app container network namespace, while DevPod recovery recreated only the app container."
tags: [devrouter, devpod, devcontainer, docker-compose, oidc, worktrees]
---

# DevPod App Recreation Strands a Shared-Namespace OIDC Sidecar

## Problem

The maintainer devcontainer originally ran the OIDC mock with
`network_mode: service:app`. Devrouter 0.0.30 can perform one bounded app
recreation when `workspace ensure` finds stale container or route state
(`.agents/skills/devrouter/SKILL.md:136`). DevPod
recreated the selected app service but left the OIDC container running in the
old app container's network namespace. The game recovered on port 3000, while
the OIDC route returned 502 because port 8090 no longer existed in the new app
namespace.

## Symptoms

- `workspace ensure` ended with
  `HTTP route readiness timed out: oidc (502)` after recreating the app.
- Container inspection showed the OIDC `NetworkMode` still referenced the
  replaced app container ID.
- The new app answered locally on port 3000, but a local discovery request on
  port 8090 failed.
- After changing the desired topology, an old workspace reported
  `Workspace upstream '<workspace>-oidc' must resolve to exactly one running container; found 0`
  until its OIDC service was reconciled once.

## What Didn't Work

Recreating the stale OIDC container repaired one running workspace, but it did
not change the topology. The next app-only recovery could strand it again.

A single successful `workspace ensure` was also insufficient proof. The second
run exercised the bounded recovery path and exposed that the app and OIDC
lifecycle ownership did not match.

## Solution

Give the maintainer OIDC service its own default/devnet attachments and the
workspace-owned `${WORKSPACE}-oidc` alias
(`.devcontainer/docker-compose.yml:90`). Route the OIDC proxy directly to that
alias (`.devrouter.yml:22`).

Keep browser and server-side issuer identity aligned for linked worktrees by
mapping the namespaced OIDC host to the host gateway
(`.devcontainer/docker-compose.yml:50`) and exporting the matching issuer into
the managed game process (`.devcontainer/post-start.sh:27`). Starter mode keeps
its existing shared-namespace topology because the rewrite is explicitly
guarded from starter execution (`.devcontainer/starter/docker-compose.yml:66`).

The game process itself remains owned by the exact devrouter 0.0.30 helper
(`.devcontainer/Dockerfile:21`) and starts through one
`devrouter-process ensure` call (`.devcontainer/post-start.sh:47`).

## Why This Works

App recreation no longer changes the network namespace that owns port 8090.
The OIDC container has a stable, independently verifiable devnet alias, so
devrouter can prove app, OIDC, and database upstream ownership separately.
Namespaced issuer URLs still reach Traefik from inside the app container and
resolve to the same OIDC endpoint used by the browser.

## Prevention

After changing devcontainer lifecycle or network ownership, run
`devrouter workspace ensure .` twice in a linked worktree. Capture the app and
sidecar container IDs plus `/tmp/devrouter-process-game.state` before and after
the second run. Both container IDs and the managed PID/process-group/fingerprint
must remain unchanged, while the namespaced app route and OIDC discovery endpoint
must respond successfully.
