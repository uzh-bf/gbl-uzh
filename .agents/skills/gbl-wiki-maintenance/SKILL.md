---
name: gbl-wiki-maintenance
description: Keep the GBL platform wiki (docs/) accurate and conformant with the Open Knowledge Format - the repo-specific extension of generic OKF/LLM-wiki practice - when to update it, how to fact-check against code, house conventions, and validation. Use whenever a change touches packages/platform, packages/ui, apps/demo-game behavior, or when doc-code drift is noticed.
---

# GBL Wiki Maintenance

The wiki in `docs/` is the ground truth AI agents use to build games on this platform — a stale page silently produces wrong games. Rule: **any PR that changes documented behavior updates the affected concept pages in the same PR.** When wiki and code disagree, the code wins and the wiki gets fixed.

## When to update

- `packages/platform` changes: state machine, `Services` contract/payloads, schema.prisma, auth, realtime, achievement engine → [game-lifecycle](../../../docs/game-lifecycle.md), [game-model](../../../docs/game-model.md), [developing-a-game](../../../docs/developing-a-game.md), [api-layer](../../../docs/api-layer.md)
- `packages/ui` or design-system upgrades → [ui-components](../../../docs/ui-components.md)
- `apps/demo-game` structural changes (routes, services layout, seed, auth flow) → [developing-a-game](../../../docs/developing-a-game.md), skills referencing demo-game paths
- **Game API or transport changes**: keep [api-layer](../../../docs/api-layer.md),
  [developing-a-game](../../../docs/developing-a-game.md), deployment guidance,
  and the new-game/frontend/backend/Playwright skills aligned with the current
  tRPC pattern. Published GraphQL compatibility may be described only as
  deprecated external compatibility; never reintroduce it as a game-building
  path.
- **Deployment setup changes**: Vercel/Neon env vars or `deploy/` k8s path changes, Prisma `binaryTargets`, auth-provider wiring (`authOptions.ts`), or the `prisma/copy.ts` build-order → [deploying-a-game](../../../docs/deploying-a-game.md); if the easy staging path or the production path moves, update the corresponding section and the `gbl-deploy-staging` skill
- Wiki also has documented caveats that expire: `COMPLETED` unreachable, `GameFacts.update` unwired, UI first-publish bootstrap pending, and demo game as primary reference. If a change invalidates one, remove it everywhere (grep the claim).

## Format: OKF v0.1, with house rules

The wiki is an [Open Knowledge Format (OKF) v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle. For format fundamentals (terminology, frontmatter semantics, reserved files, creating and converting bundles, guardrails), use a generic OKF/LLM-wiki skill if you have one installed (e.g. `llm-wiki-okf`); otherwise the spec covers them. This skill pins down only what is repo-specific:

- **Stable names**: one concept per file; the path is the concept's identity. Kebab-case nouns (`game-model.md`), no numeric prefixes — reading order lives in `docs/index.md`.
- **Frontmatter**: required `type` (short kind string, e.g. `Data Model`, `State Machine`, `Development Guide`); we also always set `title`, `description` (one sentence, reused by the index), `tags` (list), `timestamp` (ISO 8601). Preserve keys you don't recognize.
- **Links**: house deviation from the spec's bundle-absolute preference — use _relative_ links so GitHub rendering works; keep it consistent.
- **Code references** as `path:Symbol` (file plus exported function/type), not line numbers — they survive drift.
- **Reserved files**: `docs/index.md` (grouped bullets `* [Title](url) - description`; the only file carrying frontmatter limited to `okf_version: '0.1'`) and `docs/log.md` (newest-first `## YYYY-MM-DD` sections with `**Update**`/`**Creation**` entries).
- **Stricter than spec**: OKF permits broken links (not-yet-written knowledge); here they are validation errors, because agents follow wiki links blindly.

## Update workflow

1. Identify affected concepts (grep `docs/` for the symbol/behavior you changed — pages cite `path:Symbol`, so symbol names find the claims).
2. Edit the concept(s). Verify every touched claim against the code — read the source, do not write from memory. Keep the claim → `path:Symbol` citation pattern.
3. Bump the concept's frontmatter `timestamp`.
4. Add a `log.md` entry under today's `## YYYY-MM-DD` (create the section if missing, newest first): `**Update**: <concept> - <what changed and why>`.
5. If a page was added/removed/renamed: update `index.md`, grep the whole repo for inbound links (skills in `.agents/skills/gbl-*`, `AGENTS.md`, `README.md`, `apps/demo-game/README.md`).
6. Format + validate (below); commit wiki changes together with the code change they document.

## Validation

Run from the repo root:

```bash
# format (repo root and docs/ have no prettier config, so defaults apply either way;
# the prettier binary comes from demo-game's devDependencies, --no-config keeps it deterministic)
pnpm --dir apps/demo-game exec prettier --write --no-config $(pwd)/docs/*.md

# OKF conformance + link check
python3 - <<'EOF'
import re, os, sys
os.chdir('docs'); bad = []
for f in [x for x in os.listdir('.') if x.endswith('.md')]:
    s = open(f).read()
    if f not in ('index.md', 'log.md'):
        m = re.match(r'^---\n(.*?)\n---\n', s, re.S)
        if not m or not re.search(r'^type: \S', m.group(1), re.M):
            bad.append((f, 'missing frontmatter/type'))
    for m in re.finditer(r'\]\(([^)#]+?)(#[^)]*)?\)', s):
        t = m.group(1)
        if not t.startswith('http') and not os.path.exists(t):
            bad.append((f, f'broken link {t}'))
print(bad or 'OKF OK'); sys.exit(1 if bad else 0)
EOF
```

For substantial rewrites, additionally run a fact-check subagent over the changed pages (verify each load-bearing claim against the cited source file) before committing — the wiki's value is that agents can trust it blindly.
