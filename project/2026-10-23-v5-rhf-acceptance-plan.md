# GBL v5 exact-package RHF acceptance

## Approval summary

Refresh the existing demo-game pilot against current `dev`, then qualify the
exact unpublished design-system candidate in a real admin journey. Preserve the
new welcome, allocation, mobile/tablet and dice behavior. Those current player
flows use Formik and stay on Formik; this package does not migrate them again.
The real RHF route is game creation, period/segment authoring and countdown.
There is no current RHF single-select caller; the library's packed suite owns
all-family coverage.

The old pilot also changed the shared TradingForm to v5-only imports, while two
other games still consume design-system v4. Preserve their compatibility by
retaining current dev's shared TradingForm and public UI exports. Qualify the
shared UI against both dependency families rather than forcing those games
through a second migration.

The candidate still says alpha.5 but differs from registry alpha.5. Pin a
portable registry baseline in committed manifests, then use a checksummed local
candidate graph for acceptance. CI rebuilds the candidate from its immutable
public DS source, verifies the exact archive digest and runs demo-game against
those bytes. Baseline builds and exact-candidate browser proof are separate
results. A fresh registry release matching the accepted candidate remains a
later merge/readiness gate.

The user's roadmap execution approval and latest “proceed” cover this one
consumer package: history-preserving reconciliation,
bounded form/CSS/package and CI changes, synthetic local mock-runtime checks,
configured reviews, one native goal, ordinary commits/push and one draft GBL PR.
It excludes merge, ready conversion, package/release publication, deployment,
cluster access, real-environment data, resets/deletion and human notifications.
Success is a reviewed draft with green applicable CI, installed-file proof,
real browser evidence and an explicit remaining publication/manual-AT boundary.

## Execution details

### Identity and authority

- Repository: `uzh-bf/gbl-uzh`, public; resolved target is `origin/dev`.
- Reuse worktree `/Users/rschlae/Git/gbl/gbl-uzh/trees/rs-v5-alpha-pilot`
  and branch `rs/v5-alpha-pilot`. No new worktree or cross-repository stack.
- Initial pilot: `9f8c76badb7c0879fdaa3cd46428572e6fbfe32e`, clean,
  five commits ahead and twelve behind target
  `a0ce9f99b031c52bf0e1b0b4581e67c912adb78c`.
- No consumer PR exists for this branch. The August
  [W3 plan](2026-08-09-v5-gbl-w3-plan.md) is historical evidence; this is the
  active refresh plan. Its old delivery-hold prose does not invent a restriction
  beyond the user's current standing draft-delivery authority.
- Ceremony: full path; execution mode: standard; approval mode: executable
  batch. Main is execution and boundary owner. Start the bounded native goal
  after planner hardening under that existing go-ahead; no token/call/spend
  budget is invented.
- Terminal: qualified consumer draft and stopped, ownership-verified local
  runtime. Keep the final verified source head; update final CI receipts in the
  draft description/local report without a cycle of status-only source commits.
- Pause only for a material game/API/data/authority change, missing required
  review route, unsafe or unknown runtime ownership, irreproducible candidate,
  or a compatibility break requiring a different package. Finish independent
  approved work before surfacing the blocked branch.

### Contracts and reconciliation

The [DS RHF plan](https://github.com/uzh-bf/design-system/blob/rs/v5-rhf-pickers/project/2026-10-23-v5-rhf-parity-plan.md)
and ADR0002/ADR0006 own the optional RHF client entry and application-owned
validation timing with inline errors. This consumer composes existing controls;
it changes no game primitive, schema, authorization or business-rule ownership.
No new ADR is needed. A new UI entry topology, changed game lifecycle, or removal
of a public compatibility export would reopen the decision gate.

A Git merge-tree simulation left the checkout/index/branches untouched and found
thirteen conflicted paths. Resolve against current dev's responsive markup and
game behavior, carrying over only the still-applicable pilot migration:

- Admin creation/detail pages: use `Form`, `RhfTextField`,
  `RhfNumberField` and `RhfMultiSelect` from
  `@uzh-bf/design-system/react-hook-form`. Preserve controls' accessible names,
  tooltips, selectors, bounds, steps, required rules and mobile sizing.
  Numeric editing permits `number | ''`; normalize only validated values at
  existing mutation boundaries. Keep invalid dialogs open; close/reset only
  after successful submission.
- Player welcome/cockpit and their controller components: preserve current
  dev. Do not restore the old pilot's whole-page RHF forms. Preserve edit/cancel,
  draft retention, round changes, errors, results, Ready state and dice reveal.
- Shared `TradingForm`: retain current dev's v4-compatible implementation and
  its meaningful behavior tests. Keep `ReusableFormField`, `Form` and
  `MultiSelect` compatibility exports. This package's RHF acceptance claim
  concerns admin controls, not a migration of every GBL form.
- Use the public compiled CSS export and correct root/theme placement while
  preserving the 14px root, app-owned primary ramp, player tokens and 641px
  mobile/tablet boundary. Retain current tables via the appropriate public
  primitives entry. Do not erase new UI styles with a historical globals file.
- Preserve target migrations and infrastructure changes through integration;
  add no database migration, deployment edit, API change or broad cleanup.

The source-backed mapping report found an invalid period/segment submission can
close its dialog immediately. Keeping that dialog actionable is within the
accepted inline-error/recovery contract. Error tests check behavior and resolved
ARIA relationships, not exact message text. A DS number input's documented
text-editing semantics need not pretend to be a native spinbutton.

### Exact package and portable draft

Source: `e49a96a4b705a296cb4f337d9d788ead344bac85` in
`uzh-bf/design-system`. Expected archive SHA-256:

`b237f0d7f9b384c84f4027768d5c5391e72e22591c1146ef890f0603a7994f06`

Original archive:
`/Users/rschlae/Git/df/design-system/trees/rs-v5-uzh-alignment/project/_local/rhf-parity-candidate/uzh-bf-design-system-5.0.0-alpha.5.tgz`.

Main rehashed it and rebuilt/repacked the same source with Node 22.16.0 and pnpm
10.30.0 in the existing isolated DS tool container. The digest matched exactly.
This proves repeat-build identity in that environment; a fresh CI checkout still
must independently meet the same digest. That tool container is stopped.

Committed graph: demo-game and its v5 external-consumer fixture use exact
registry `5.0.0-alpha.5`. Shared UI's default development dependency stays at
current dev's `~4.1.6`; its public peer range supports the verified v4/v5 routes.
Restore current dev's React compatibility surface where the old pilot narrowed
it without keeping its other consumers coherent. Verify the v4 fixtures/examples
rather than claiming untested compatibility. For every CI game cell, probe DS
resolution both from the game and the linked UI; manifest pins alone are not
proof. The demo candidate cell temporarily supplies the archive to both.
Retain other games' v4 pins. Remove the expired alpha.3 maturity exception;
create no blanket maturity or peer-dependency bypass.

Candidate graph: copy the original checksummed tarball only into ignored local
artifacts. In an isolated test install, set demo-game and shared UI development
dependencies to that archive using pnpm's file protocol; regenerate that
temporary lock and then require a frozen install. Snapshot and restore only the
two manifests and lockfile this step owns; preserve unrelated work. Run strict
UI consumer verification with the same candidate specifier. Extend the existing
external verifier's current unfrozen install: create a temporary lock, retain
its manifest/lock as receipt evidence, then install frozen with strict peers and
build. Run distinct v4 and v5 candidate cells. For the candidate cell, verify its
archive digest before any install and retain installed-resolution/file proof. Installed resolution
from demo-game and shared UI must map to the candidate, every archived package
file must match, and React/React DOM/RHF must each have one effective runtime in
the demo bundle. A version string, symlink, successful build or source import is
not enough.

CI: extend the existing Playwright workflow with one bounded preparation job
that checks out the immutable public DS commit, uses its pinned Node/pnpm and
frozen lock, builds/packs and checks the expected archive hash. Upload it as a
short-lived same-repository CI artifact; this is build evidence, not package
publication. The demo-game cell downloads/rechecks it and uses the candidate
graph before builds/tests. Existing rate-wars and central-bank cells retain
their v4 graph and regression proof. Keep job permissions minimal and existing
OIDC/local Postgres isolation. Do not run arbitrary fork input or execute code
from review comments. Pin newly introduced actions to full verified SHAs.

No tarball, local file dependency, temporary candidate lock or host-specific path
is committed as the portable installation graph. A registry alpha.5 baseline
build does not establish the candidate's new error policy. Before merge/ready,
a separately authorized registry version matching accepted candidate contents
must replace this staging dependency and its frozen graph must qualify. No
publication authority is requested by this plan.

Research: official pnpm documentation retrieved through Context7 on October 23
covers workspace dependency overrides, local tarball integrity and frozen
installs. pnpm rehashes local archives; acceptance also checks archive and
installed files independently. Primary references:
[pnpm installation](https://pnpm.io/cli/install) and
[dependency resolution](https://pnpm.io/settings#overrides).
An npm metadata read confirms the registry alpha.5 RHF subpath exists; its
registry integrity differs from this candidate. No major dependency upgrade is
part of this package.

### Ownership, slices and checks

| Workstream | Slice | Exclusive owner and handoff | Acceptance |
| --- | --- | --- | --- |
| Integration, graph, CSS and peer contracts | 1 | Main owns merge/graph/shared paths; hands admin paths below to one executor only after resolving the target baseline | Clean integrated diff, preserved current player/shared UI behavior, coherent v4/v5 graph and passing applicable types/builds |
| Admin adapter wiring | 1 | Executor owns only admin/games.tsx, admin/games/[id].tsx and AdminInputField.tsx after explicit main handoff; no Git/runtime effects | Required/bounds/reset semantics and current responsive hooks retained; main runs focused container proof |
| Candidate and CI provenance | 2 | Main owns workflow, verifier and fixture paths; critical coupling between exact bytes, effective peers and job behavior | Matching archive digest, strict temporary-lock/frozen installs and positive v4/v5 resolution proof |
| Focused admin behavior coverage | 3 | Executor owns only demo-game-flow.spec.ts and support/demoGame.ts after adapter fields are stable; main owns runtime and test invocation | Missing invalid-submit/recovery/reset contracts protected without duplicating player or TradingForm tests |
| Integrated proof, docs and delivery | 3 | Main owns docs, galleries, reviews, source finalization and forge effects | Real browser/screenshot evidence, current exact-head CI, required reviews, draft delivery and stopped owned runtime |

Use one helper at a time. Parent records each ownership transfer and does not
edit the helper's paths until it hands back a patch. A helper edits source only;
parent owns installs, runtime commands, commits and all external effects.

Main owns reconciliation, public peer/API seams, candidate provenance, runtime
ownership, CI effects, integration, final proof and delivery. Delegate settled
bounded admin form/test edits after those seams are fixed. One writer per
path set; no helper agent may start services, push or send messages.

1. **Reconcile current game and package surface.** Commit the approved plan,
   then merge the recorded target into the pilot without rewriting history.
   Resolve the named paths according to the contracts above. Restore current
   player/TradingForm behavior and port admin fields, dedicated imports and CSS.
   Pin the portable graph and qualify root/UI/demo types, lint, formatting and
   builds, including explicit type checks because Next currently ignores build
   type errors. Run existing affected player/tablet and legacy form regressions.
   Main owns the coupled integration, then transfers the two admin pages and
   obsolete field wrapper exclusively to the mapped executor. Commit a coherent v5 consumer refresh.
2. **Make candidate verification reproducible.** Extend only existing
   `.github/workflows/playwright-testing.yml`,
   `packages/ui/scripts/verify-consumer.mjs`,
   `packages/ui/fixtures/next-consumer/package.json`, the two target manifests,
   `pnpm-lock.yaml` and `pnpm-workspace.yaml` as needed for the named graph.
   The existing verifier may accept an explicit DS version/archive specifier
   for its temporary fixture; do not create a second verification framework.
   Prove a strict v4 baseline consumer and v5 candidate consumer separately.
   Add no new maintained helper file without a concrete need. Test digest
   rejection and real installed-file resolution; reuse installer/build checks
   where unchanged. Main owns this provenance-coupled workflow/verifier slice. Commit the exact candidate
   qualification path.
3. **Prove the actual journey and deliver.** Extend existing
   `playwright/tests/demo-game-flow.spec.ts` and
   `playwright/tests/support/demoGame.ts` for missing admin invalid-submit,
   error-recovery and reset contracts. Preserve current demo-game tablet/dice
   coverage and shared TradingForm behavior. Update only affected
   `docs/ui-components.md`, `docs/game-patterns.md`, `docs/log.md`,
   `.agents/skills/gbl-frontend-game-ui/SKILL.md` and
   `.agents/skills/gbl-playwright-e2e/SKILL.md` for actual mixed Formik/RHF
   use, dedicated imports and evidence boundaries. Verify wiki links and touched
   claims. Final simplification, risk-selected review and integrated review
   follow the configured routes. Create/update one draft PR against `dev`,
   attach inspected synthetic screenshots and complete its applicable CI.

The merge simulation also flags `playwright/tests/support/waits.ts`, historical
welcome/cockpit/report edits, the frontend skill and documentation. Resolve
mechanical overlaps without preserving obsolete pilot behavior; don't add new
features during conflict resolution. Delete `AdminInputField.tsx` only after
the current caller scan proves it unused.

### Test portfolio and runtime

| Consequential risk | Obligation and owner | Existing seam and action |
| --- | --- | --- |
| Invalid admin input writes or closes before recovery | Extend existing; executor tests in slice 3, main implementation proof in slice 1 | Existing create-game/period flow: blocked mutation, linked inline errors, actionable dialog, valid payload and success reset |
| Selection or numeric buffers leak stale values | Extend existing; executor tests in slice 3, main integration in slice 1 | Current segment/countdown path: selected items, empty/invalid numbers and reset; server rules unchanged |
| Player redesign or other UI consumers regress | None added; main reuses/runs existing coverage in slices 1 and 3 | Current welcome/profile/allocation/tablet/dice and shared TradingForm tests, plus two v4 game suites |
| Tests exercise wrong alpha.5 bytes or duplicate peers | Extend existing verifier; main, slice 2 | Digest rejection, temporary-lock/frozen candidate graph, installed-file/resolution comparison and strict v4/v5 UI consumer cells |
| CSS breaks layout or accessibility | None added; main runs existing checks and real gallery in slice 3 | Keyboard/label/error checks and synthetic captures at 390px, 640/641px boundary, tablet and desktop; root/ramp preserved |

Use the repository's pinned Node 24.16.0/pnpm 11.6.0 for GBL installs, builds and
tests inside the source-path-owned local container. The DS preparation job uses
Node 22.16.0/pnpm 10.30.0. Resolve the retained pilot by canonical checkout path
through the owner tool before any runtime mutation; runtime health is currently
unverified. Resume/reconcile only that owned environment using its supported
lifecycle. Run the environment doctor on real startup/login failure. Keep
Postgres/OIDC synthetic and local; no Infisical production environment or real
data is needed. No reset, volume deletion or accept-data-loss flag is allowed.

The local acceptance needs mock admin login, create game, create period,
select story/learning items, set countdown, verify invalid/valid RHF submissions
and reset, then a current player setup/allocation/dice smoke. Use the actual
routed host with matching cookie/issuer origins, not a guessed host. Tests use
synthetic records and avoid exact prose assertions. Capture before/after
affected admin states plus current player-layout regression evidence using
`rs-build-screenshot-gallery`; upload reviewed images to this repository via
host `gh` and preserve access/provenance. No fresh screenshot can be claimed
before a real browser run.

After the last runtime-dependent check, restore temporary candidate graph
edits and verify the portable baseline frozen install, stop the exact runtime
and re-read owner/provider/routes. Preserve data/caches and the worktree.
Manual screen-reader, actual Safari and physical-device evidence remain
separate GA gates; Chromium automation does not substitute for them.

### Review and delivery

Planning: one native planner hardening loop, maximum three rounds. An opposing
provider pass is optional and does not replace it. Earlier bounded AGY approval
excluded unpublished implementation plans, so do not disclose this draft under
that older permission. Use the trusted native planner for the complete draft.

Implementation: simplify substantive slices and run one risk-selected reviewer
on form, peer and CI seams as armed by the workflow. Validate every finding.
Use the configured integrated-final route and its standing continuity ladder;
the parent's prior Claude weekly-limit evidence is reusable until relevant
quota evidence changes. Send only eligible complete scope; preserve private
receipts and synthetic auth state. No human reviewer request or review reply.

One coherent consumer PR is the delivery package; it is dependent on DS drafts
but is not a cross-repository stack. Its body distinguishes portable baseline,
exact candidate local/CI proof and publication/manual gates. Keep it draft.
Use one supported CI watcher; a new scheduled wakeup requires separate authority.
No merge/readiness/release request is implied by green candidate CI.

## Progress

Status: executing the approved consumer package. Native planner round 2
approved this plan. Main owns integration and delivery in standard mode.

Current dev `a0ce9f99b031c52bf0e1b0b4581e67c912adb78c` is reconciled in the
ordinary pending merge. Current player forms/layouts, shared TradingForm and
public UI exports are retained. Admin creation, period/segment and countdown
use the dedicated DS RHF entry with inline errors, reset and recovery.

Two executors supplied bounded admin source/test edits; a third completed the
verifier's RHF peer-context probe and CI receipt/restoration paths. Main checked
and integrated their changes. Main owns graph, runtime and external effects.
Candidate manifests and runtime compatibility edits are restored byte-for-byte
before source delivery; the baseline dependency graph stays portable.

Passing local evidence: demo and shared UI unit suites; affected type checks;
platform/UI and registry demo builds; strict external v4/v5 Next consumer builds;
exact candidate digest and 264 matching package files in game/UI contexts;
admin invalid-submit, recovery, mutation payload and reset behavior; cockpit
allocation/Ready/navigation at responsive boundaries. The complete synthetic
browser suite and packed TradingForm v4/v5 browser cells are running or pending.
Private receipts are in `project/_local/`; screenshots show synthetic data only.

Remaining: finish source checks and browser cells, committed simplification and
risk review, integrated final review, one draft PR with inspected screenshots
and exact-head CI, then stop and verify the owned runtime. Preserve final-tip
CI results in private receipts and the draft description to avoid status-only
CI restart commits. Package publication and manual AT/Safari/device checks
remain separate readiness gates. No merge, release or deployment is authorized.
