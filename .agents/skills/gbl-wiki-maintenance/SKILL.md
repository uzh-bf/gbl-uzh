---
name: gbl-wiki-maintenance
description: Keep the GBL platform wiki (docs/) accurate and conformant with the Open Knowledge Format - when to update it, how to fact-check against code, frontmatter/index/log conventions, and validation. Use whenever a change touches packages/platform, packages/ui, apps/demo-game behavior, or when doc-code drift is noticed.
---

# GBL Wiki Maintenance

The wiki in `docs/` is the ground truth AI agents use to build games on this platform — a stale page silently produces wrong games. Rule: **any PR that changes documented behavior updates the affected concept pages in the same PR.** When wiki and code disagree, the code wins and the wiki gets fixed.

## When to update

- `packages/platform` changes: state machine, `Services` contract/payloads, schema.prisma, auth, realtime, achievement engine → [game-lifecycle](../../../docs/game-lifecycle.md), [game-model](../../../docs/game-model.md), [developing-a-game](../../../docs/developing-a-game.md), [api-layer](../../../docs/api-layer.md)
- `packages/ui` or design-system upgrades → [ui-components](../../../docs/ui-components.md)
- `apps/demo-game` structural changes (routes, services layout, seed, auth flow) → [developing-a-game](../../../docs/developing-a-game.md), skills referencing demo-game paths
- **tRPC migration merges to `dev`** (standing item): rewrite [api-layer](../../../docs/api-layer.md) — GraphQL section deleted, tRPC becomes current; also update `gbl-new-game-app` + `gbl-frontend-game-ui` skills and the `generateBaseMutations` reference in [developing-a-game](../../../docs/developing-a-game.md)
- Wiki also has documented caveats that expire: `COMPLETED` unreachable, `GameFacts.update` unwired, `@gbl-uzh/ui` unpublished/placeholder `Button`, demo game as sole reference. If a change invalidates one, remove it everywhere (grep the claim).

## Format: Open Knowledge Format (OKF) v0.1

The wiki is an OKF bundle ([spec](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)) — a directory of markdown concepts readable by any agent, no tooling required. House rules as adopted here:

- **One concept per file**; the file path is the concept's identity. Names are stable kebab-case nouns (`game-model.md`), no numbering — reading order lives in the index.
- **Frontmatter** on every concept (YAML between `---`): required `type` (short kind string, e.g. `Data Model`, `State Machine`, `Development Guide`); we also always set `title`, `description` (one sentence), `tags` (list), `timestamp` (ISO 8601). Unknown extra keys are allowed; never remove ones you don't recognize.
- **Reserved files** — never concepts: `docs/index.md` (grouped bullet index, `* [Title](url) - description`; only file allowed frontmatter-wise to carry just `okf_version: '0.1'`) and `docs/log.md` (change log, newest-first `## YYYY-MM-DD` sections with `**Update**`/`**Creation**` entries).
- **Links** are ordinary markdown links = untyped relationship edges; the surrounding prose carries the meaning. House deviation from the spec's recommendation: we use _relative_ links (not bundle-absolute `/...`) so GitHub rendering works; keep it consistent.
- **Code references** as `path:Symbol` (file plus exported function/type), not line numbers — they survive drift.
- Conformance = every non-reserved `.md` in `docs/` parses frontmatter with non-empty `type`. Consumers must stay permissive (tolerate unknown types, broken links) — but we still fix broken links, see validation.

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
