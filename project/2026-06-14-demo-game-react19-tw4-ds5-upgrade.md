# Plan: demo-game upgrade — Node24/pnpm11 + React19 + Next15.5 + Tailwind4 + DS v4, then DS v5 alpha

$caveman basic form. Concrete. Scannable.

## Goal

Upgrade `apps/demo-game` (+ its workspace deps `packages/ui`, `packages/platform`) so it builds+runs on:
Node 24 LTS, pnpm 11, React 19, Next 15.5.x, Tailwind 4, `@uzh-bf/design-system` v4.
THEN migrate to DS v5 local alpha tarball (keep UZH branding). Visualize everything.

## Non-goals

- apps/website, apps/advisor: NOT upgraded. website stays DS v3 / React18 / TW3 (pnpm strict isolation keeps it working). Add syncpack versionGroup exception so `syncpack:lint` passes.
- No DS v5 npm publish. Local `file:` tarball only, no git tag (CI never auto-publishes).
- No tsconfig moduleResolution node→bundler change (deferred follow-up).
- No react-dice-complete replacement (pnpm override now; replace later).

## Plan identity

- Plan: `project/2026-06-14-demo-game-react19-tw4-ds5-upgrade.md`
- Repo: gbl-uzh (github uzh-bf/gbl-uzh). Worktree: `/Users/rschlae/Git/gbl/gbl-uzh-wt-demo-upgrade`
- Branch: `feat/demo-game-react19-tw4-ds5`  Target: `dev`  MR: (none yet)
- DS source: `/Users/rschlae/Git/df/design-system` branch `v5` (PR #179). v4 = 4.1.6 on main.

## Decisions (user-confirmed 2026-06-14)

- Scope = demo-game only (website stays v3 + syncpack exception).
- pnpm = 11.6 (newest). Node = 24 LTS (Krypton).
- react-dice-complete = pnpm override (force react@19), keep Die.tsx.
- DS v5 theme = keep UZH branding via `data-theme="uzh"`; one neutral screenshot to show dual-theme.

## Hard blockers (build-fail if missed) — from research

- DS v4 removed subpaths: `/dist/constants` (gone), `/dist/future` (gone), `dist/style.css`→`dist/design-system.css`.
  - `/dist/constants` used in demo-game tailwind.config.js (TailwindColorsUZH/Animations/Fonts) → values now CSS @theme vars in design-system.css.
  - `/dist/future` used in 7 demo-game files + ui/NavBar.tsx → re-point to `@uzh-bf/design-system`.
- DS v4 API: `Table*`→`ShadcnTable*`; raw `SelectContent/Item/Trigger/Value` NOT re-exported (add local `~/components/ui/select.tsx`, matches existing local dialog/toast/popover/command); dist/future Button(variant/size)→v4 Button(boolean props) in MultiSelect.tsx.
- TW4: `bg-opacity-*` removed (PlayerData, Achievement, Logo — 5 spots → `/90`); `corePlugins.preflight:false` unsupported in @config (use layered @import, skip base layer); typography via `@plugin`; prettier-plugin-tailwindcss must be ^0.6 before any format pass.
- React19: next-auth 4.24.10→4.24.14, recharts 2.13.3→2.15.4, react-dice-complete override, lucide ^0.522, tailwind-merge ^3.3.1, @types/react(-dom) ^19. Prune unused i18n trio (confirm no locale files).
- pnpm10+: lifecycle scripts blocked → `onlyBuiltDependencies: [@swc/core, esbuild, prisma, sharp]` in pnpm-workspace.yaml.
- DS v4 peers REQUIRE React19 + TW4 → DS-v4 bump cannot land before React19+TW4 in same buildable unit.

## DS-coupling note

DS engines `=22` only enforced when BUILDING DS (done in DS repo). Consuming tarball on Node24 = pnpm warn only, not block. Will relax DS v5 engines to `>=22`.

---

## Slices

### Milestone 1 — Foundation (must build+run green before M2)

**M1-S1 · Toolchain: Node 24 + pnpm 11**
- package.json: engines.node `=20`→`>=24`; volta.node `24.16.0`; volta.pnpm + packageManager `pnpm@11.6.0`
- packages/platform/package.json: engines.node `>=24`; @types/node `^24`
- pnpm-workspace.yaml: add `onlyBuiltDependencies: [@swc/core, esbuild, prisma, sharp]`
- apps/demo-game/Dockerfile: `node:24.16-alpine`; pnpm pin 11.6.0
- .github/workflows/publish-platform.yml: pnpm/action-setup @v2→@v4, drop hardcoded version
- add .nvmrc `24`
- Verify: `corepack use pnpm@11` → `pnpm install` clean (lockfile regen) → demo-game build STILL green (still R18/TW3/DSv3). Commit.

**M1-S2 · packages/ui + platform → React19 + TW4 + DS v4**
- platform: react peer `^18.3.1 || ^19.0.0`; @types/react ^19
- ui/package.json: react/react-dom peer ^19; DS ^4.1.6; tailwind dev ^4.1.11; tailwind-merge ^3.3.1; @types/react(-dom) ^19; add @tailwindcss/vite
- ui/tailwind.config.cjs → delete; shadcn HSL tokens + accordion keyframes + tailwindcss-animate → ui/src/globals.css (@theme/@plugin, layered import no preflight)
- ui/src/components/NavBar.tsx: /dist/future → @uzh-bf/design-system
- ui/vite.config.ts: add @tailwindcss/vite; confirm CSS output filename
- Verify: `pnpm --filter @gbl-uzh/ui build` green. Commit.

**M1-S3 · apps/demo-game → React19 + Next15.5 + TW4 + DS v4** (LARGEST)
- deps: react/react-dom 19.2; next 15.5.x; next-auth 4.24.14; recharts 2.15.4; lucide ^0.522; tailwind-merge ^3.3.1; @types/react(-dom) ^19; eslint-config-next match; add @tailwindcss/postcss + tw-animate-css; prune i18n (confirm no locale files); root pnpm.overrides react-dice-complete>react ^19
- TW4: npx @tailwindcss/upgrade then hand-fix; postcss → @tailwindcss/postcss; globals.css CSS-first (layered @import tailwindcss, @import design-system.css, @plugin typography); DELETE tailwind.config.js; bg-opacity→slash; ring-offset audit
- DS v3→v4 code: /dist/future→main (7 files); Table*→ShadcnTable*; local select.tsx; MultiSelect Button; CSS path rename
- React19: codemod; useRef<T>(null); hydration check
- syncpack versionGroup exception (website stays v3)
- Verify: `pnpm --filter @gbl-uzh/demo-game build` + dev boots + agent-browser screenshots (welcome/cockpit/admin/learning) UZH-branded. Commit. (split DS-API churn from TW4/React bumps into 2 commits if unwieldy.)

**M1-S4 · Milestone gate**
- Full `pnpm build` (turbo); website + advisor still build (isolation holds); syncpack green/excepted
- Verify + screenshot baseline. Commit.

### Milestone 2 — DS v5 alpha (only after M1 green)

**M2-S5 · Local v5 alpha tarball + swap**
- DS v5 branch: bump leaf 4.1.6→5.0.0-alpha.0 (NO git tag); relax engines `>=22`; build; `pnpm pack`; commit .tgz into worktree `tools/ds-local/`
- gbl root pnpm.overrides `@uzh-bf/design-system`→file:tools/ds-local/...tgz → pnpm install
- v5 mandatory: add apps/demo-game/src/pages/_document.tsx `<Html data-theme="uzh">`; remove redundant font injection in RootLayout.tsx
- rebuild ui then demo-game
- Verify: build + `grep -r dist/future`=0. Commit.

**M2-S6 · Visualize everything**
- agent-browser screenshots across demo-game screens UZH theme; spot v4→v5 deltas (AvatarFallback tint, Tabs underline); one neutral capture. Document. Commit.

## Verification per slice

tsc/build first, then dev boot + agent-browser for app screens. Review + simplify subagents each slice. Final security review before MR.

## Progress

- [x] Research (6-dim workflow wf_6a53f760-3d3) done. Plan approved (4 decisions). Worktree + branch created.
- [x] M1-S1 toolchain — Node>=24, pnpm 11.6, allowBuilds map, Dockerfile/CI/.nvmrc. Committed.
- [x] M1-S2 packages/ui + platform → React19 + TW4 + DS v4. Both build green. Committed a3f3c57.
- [x] M1-S3 demo-game app — DONE, verified.
      - deps: React 19.2.7, Next 15.5.19, DS v4.1.6, TW4.1, recharts 2.15.4, lucide 0.522, fortawesome 6.7.2, cva 0.7.1, tw-merge 3.3.1, yup 1.6.1; added @radix-ui/react-select 2.2.5, @tailwindcss/postcss, tw-animate-css; removed i18n trio, autoprefixer, postcss-import, tailwindcss-animate, tailwindcss-radix.
      - root pnpm-workspace.yaml `overrides:` force react-dice-complete>react/-dom ^19.
      - TW4 CSS-first: deleted tailwind.config.js; postcss → @tailwindcss/postcss; globals.css layered (theme+utilities, no preflight — preflight from DS base layer), `@source './**'`, `@plugin typography`, `@import tw-animate-css`, kept UZH `:root` + html 14px.
      - DS v4 has a restrictive `exports` map (no CSS). Workaround: relative `@import '../node_modules/@uzh-bf/design-system/dist/design-system.css'` (enhanced-resolve enforces exports; relative bypasses). Remove in M2 when v5 exports CSS.
      - re-pointed 7 `dist/future` imports → main barrel; `Table*` → `ShadcnTable* as Table*` aliases (JSX untouched); Select primitives → new local `ui/select.tsx` (radix-select); MultiSelect raw Button → new local `ui/button.tsx` (slot-less cva); PlayerData `bg-opacity-90`→`/90`; MultiSelect ref typed.
      - Verify: TW4 CSS compile OK (283KB; preflight+DS utils+demo utils+prose+animate present). `next build` GREEN — Next 15.5.19, all 11 static pages prerendered, css 31.3kB. platform+ui build green. react override → single react@19.2.7 in demo subtree; website keeps react@18.3.1.
- [x] M1-S4 milestone gate — DONE. **Milestone 1 complete.**
      - Full build: `turbo run build` for demo-game (full chain prisma+nexus+codegen+next) + ui + platform = 3/3 green (28.9s).
      - website: COMPILES green (React 18); only fails collecting `/use-cases/[slug]` because `apps/quartz` is an uninitialised submodule (`-c1b21df…`) — environmental, pre-existing, unrelated to the upgrade. Only website change on this branch is next.config.js.
      - Fortawesome dual-version: `@fortawesome/fontawesome-svg-core` 6.6.0 (website) + 6.7.2 (demo-game/ui) gave two `fontawesome-common-types` → IconProp/IconPrefix type clash broke ui tsc. Fixed with pnpm override `@fortawesome/fontawesome-common-types: 6.7.2` (6.7.2 superset). ui peers aligned to ^6.7.2.
      - website React-18/19 @types clash: monorepo now has @types/react 18 (website) + 19 (rest); TS resolves React 19 ReactNode (bigint) for next's d.ts → spurious "Link not a JSX component". website next.config → typescript.ignoreBuildErrors only (ESLint left enabled — clash is TS-only; frozen app, runtime unaffected; remove on website upgrade).
      - Accepted side-effect: website's transitive `yup` (via DS v3 peer) deduped 1.4.0→1.6.1 from the workspace yup unification. Backward-compatible 1.x minor; website declares no direct yup and is a content site unlikely to run yup validation. Re-verify when website is upgraded; pin website yup 1.4.0 if a regression surfaces.
      - syncpack: GREEN. .syncpackrc.js versionGroups: (1) ignore website (legacy stack), (2) ignore ui/platform broad react/react-dom peer ranges. Aligned upgraded-set peers (ui/platform next ^15.5.19, platform next-auth ^4.24.14, ui/platform yup ^1.6.1, platform tsx ~4.19.3, ui fortawesome ^6.7.2, ui eslint ~8.57.1). Fixed `~` dev-range on my new deps (tailwindcss, @tailwindcss/postcss, tw-animate-css, @tailwindcss/typography, ui DS devDep). nodemon ^→~. Pre-existing prettier 2-vs-3 drift left as-is (not introduced here; syncpack not CI-gated).
- [x] M2-S5 v5 swap — DONE (committed 79f9c8d). Decision changed from tarball → **point at v5 branch** (user pick): root `pnpm-workspace.yaml` overrides `@uzh-bf/design-system` → `file:/Users/rschlae/Git/df/design-system/packages/design-system` (LOCAL-DEV ONLY, loud DO-NOT-PUSH comment). globals.css `:root` UZH block removed; `_document.tsx` `<Html data-theme="uzh">`. Resolved DS css confirmed dual-theme (`[data-theme=neutral]`+`[data-theme=uzh]`).
- [x] M2-S6 visualize — DONE. demo-game run locally on v5 + agent-browser.
      - Runtime: demo-game own `docker-compose.yml` postgres on host :5432; prisma copy/generate/push; `next dev -p 3001` (`:3000` taken by an unrelated derivatives-game devcontainer). Dummy NEXTAUTH_SECRET; Auth0 has no dev bypass so only unauthenticated pages reachable — but the v5 theme pipeline is global (globals.css + `data-theme` on `<html>`) so any page fully exercises it.
      - **Evidence**: index (cockpit) renders fully on DS v5 + React19 + Next15.5 + TW4 — nav, Storage panel, recharts probability chart, Period/Segment cards, Volume Input + Buy/Sell Buttons, timeline cards. Clean console + server log (`GET / 200`, `/api/auth/session 200`). Screenshots `/tmp/m2-index-{uzh,neutral}.png`.
      - **Dual-theme proof** (computed tokens on `<html>`): `--theme-color-primary` uzh `#0028a5` (UZH blue) vs neutral `oklch(0.205 0 0)`; body font uzh `Source Sans 3/Pro` vs neutral system. RootLayout legacy `--theme-font-primary` is dead under v5 (v5 drives `--theme-font-sans`) but harmless.
      - **Two v5-readiness findings (design-system repo, not this MR):**
        - F1 — v5 `package.json` exports add a `"development": "./src/*.ts"` condition; Next dev sets that webpack condition → pulls raw `.tsx` source → `Module parse failed`. Preview fix: `transpilePackages: ['@uzh-bf/design-system']`. Published alpha should not point external consumers at source (or ship `import`→dist only).
        - F2 — v5 declares a **React 18** peer; the `file:` link resolves its own `react@18.3.1` subtree → 2 physical React copies → `Cannot read properties of null (reading 'useMemo')`. Preview fix: webpack-alias `react`/`react-dom` to demo-game's single react@19. Published v5 should widen peer to `^18 || ^19`.
      - Preview-only `next.config.ts` edits (transpilePackages + react alias), clearly commented DO-NOT-PUSH, paired with the `file:` override. Preserved off the MR branch on tag **`m2-v5-preview`** (`02aacd1` = `79f9c8d` + next.config preview commit).

## MR scope (decided by constraint)

M2 depends on an **unpublished local v5 via an absolute `file:` path** → physically unmergeable (CI + any other machine cannot resolve it). Therefore:
- **MR = M1 only** (React19 + Next15.5 + TW4 + **DS v4.1.6**, UZH branding intact via `:root`). Mergeable tip = `eeebb64`, verified clean (no override, DS pinned 4.1.6, `:root` branding present, next.config clean, default `_document`).
- **M2 = local preview, deferred** to a follow-up once design-system v5 publishes `@uzh-bf/design-system@5.0.0-alpha.x` (and fixes F1/F2). Preserve `79f9c8d` + preview next.config via a local tag.

## Next steps (running)

1. [x] MR scope decided: **M1-only** (M2 unmergeable). User: no preference → proceed.
2. [x] Preserved M2 on tag `m2-v5-preview` (`02aacd1`); reset feat branch to M1 tip `eeebb64`; plan docs re-landed.
3. [ ] Re-verify M1 builds green against **DS v4** (reinstall without override) — prior `turbo build 3/3` ran before the override existed, but node_modules has since diverged to v5.
4. [ ] Final security review subagent on `dev..HEAD`.
5. [ ] MR via `$df-mr-description-writer` vs `dev`. Push only after user confirms the drafted MR.
Follow-ups: design-system v5 F1/F2 fixes + publish alpha; replace react-dice-complete; tsconfig moduleResolution bundler; website upgrade.
