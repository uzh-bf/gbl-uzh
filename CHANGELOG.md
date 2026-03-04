# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.42](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.41...v0.4.42) (2026-03-04)


### Enhancements

* add namesByRole for achievements, add optional redis event target for subscriptions ([b3d0dbb](https://github.com/uzh-bf/gbl-uzh/commit/b3d0dbb9414ef946cf85cf3ac62108afe3ad6a48))

### [0.4.41](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.40...v0.4.41) (2026-03-04)


### Bug Fixes

* return null if not dirty to ensure we can catch it in the frontend ([566b6a8](https://github.com/uzh-bf/gbl-uzh/commit/566b6a8709f9e3f8ffaa1ce4eca2dd49b51dc802))

### [0.4.40](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.39...v0.4.40) (2026-03-02)


### Bug Fixes

* adjust transaction timeout to 120000 ([4f76af7](https://github.com/uzh-bf/gbl-uzh/commit/4f76af7356670a6ed5ed3120d7e33ea313043e88))

### [0.4.39](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.38...v0.4.39) (2026-03-02)


### Bug Fixes

* increase transaction timeout for segment and period interactions ([2f370c7](https://github.com/uzh-bf/gbl-uzh/commit/2f370c77f6553fca12d2c4f06c5e6242cd8a5fea))

### [0.4.38](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.37...v0.4.38) (2026-03-02)


### Bug Fixes

* ordering of segments ([4c9f536](https://github.com/uzh-bf/gbl-uzh/commit/4c9f536e18e2dfe28621060f9ec051a2f6e842d6))
* use descriptionsByRole with generically usable JSON object ([fc90310](https://github.com/uzh-bf/gbl-uzh/commit/fc90310db95d2199dbfd4a6c5fc9123abec344f4))

### [0.4.37](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.36...v0.4.37) (2026-02-26)


### Features

* conditional achievements ([#129](https://github.com/uzh-bf/gbl-uzh/issues/129)) ([9e8fe7c](https://github.com/uzh-bf/gbl-uzh/commit/9e8fe7c411a5dcae7c0f78175c6e030ba5dd5509))

### [0.4.36](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.35...v0.4.36) (2026-01-30)


### Other

* add repository url for npm provenance ([75338b5](https://github.com/uzh-bf/gbl-uzh/commit/75338b5f2cd9ba03dbb5100a99bd276394190bfb))

### [0.4.35](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.34...v0.4.35) (2026-01-30)


### Build and CI

* publish platform via npm trusted publishing ([bc2d411](https://github.com/uzh-bf/gbl-uzh/commit/bc2d411db885b91a4b0b426a0eceb13509deec89))

### [0.4.34](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.33...v0.4.34) (2026-01-30)


### Bug Fixes

* **apps/demo-game:** install without frozen lockfile (hack) ([3f9c1db](https://github.com/uzh-bf/gbl-uzh/commit/3f9c1db40a8487e8d654f62babcdbf49ac2f0242))
* build for demo-game ([01037af](https://github.com/uzh-bf/gbl-uzh/commit/01037affe19535f955fa8c326c761d8d878b3e0b))
* create migration for platform updates ([87f2ff4](https://github.com/uzh-bf/gbl-uzh/commit/87f2ff45bffc92d36b94b4a72d8f24a27d40b3c4))
* issue with events ([27265cb](https://github.com/uzh-bf/gbl-uzh/commit/27265cbad09a9f9a927b0ea6739ea19b12824c6a))
* optional hooks ([64de0e3](https://github.com/uzh-bf/gbl-uzh/commit/64de0e318c1710e4545d9d67ac3b71d69ef0f4d0))
* prisma schema with default game facts ([29876d6](https://github.com/uzh-bf/gbl-uzh/commit/29876d63fa42a4991ee5259f7549ca0a36fc3882))


### Other

* add GAME_STATE_UPDATED ([2b9fb5e](https://github.com/uzh-bf/gbl-uzh/commit/2b9fb5e2f67f3d597038d69a7ca0a11189fe31bc))
* lockfile maintenance ([f20c29c](https://github.com/uzh-bf/gbl-uzh/commit/f20c29cceec87ca80ddf14e80158ae5501de0336))
* run build locally ([aed9b5b](https://github.com/uzh-bf/gbl-uzh/commit/aed9b5be88dc55c86a8bebddc685295bdbb3ee09))

### [0.4.33](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.32...v0.4.33) (2025-11-25)


### Features

* **platform:** robustify race conditions with retry and before and after hooks ([86dd543](https://github.com/uzh-bf/gbl-uzh/commit/86dd543b592f1f2e6f8279d1f83c49b2fc78011c))


### Other

* Upgrade to Prisma v6 ([#115](https://github.com/uzh-bf/gbl-uzh/issues/115)) ([e2db9e5](https://github.com/uzh-bf/gbl-uzh/commit/e2db9e57628352b7fbad89c5532add6edb9a0ceb))

### [0.4.32](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.31...v0.4.32) (2025-06-26)


### Features

* **platform:** add decision to result document ([#113](https://github.com/uzh-bf/gbl-uzh/issues/113)) ([db50cef](https://github.com/uzh-bf/gbl-uzh/commit/db50cef9b765abe3abd0ca9ee61e29151c8cadd1))

### [0.4.31](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.30...v0.4.31) (2025-06-25)


### Bug Fixes

* **platform:** update gamefacts db when toggling ([#112](https://github.com/uzh-bf/gbl-uzh/issues/112)) ([a161b3d](https://github.com/uzh-bf/gbl-uzh/commit/a161b3dc6abe8bfc6887587365441fec531c1bbd))

### [0.4.30](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.29...v0.4.30) (2025-06-23)


### Features

* **platform:** adding toggle switch and toggle event for subscription ([#110](https://github.com/uzh-bf/gbl-uzh/issues/110)) ([1756d19](https://github.com/uzh-bf/gbl-uzh/commit/1756d192973123b50bb2f125ee7fcecf6cf59786))


### Bug Fixes

* **platform:** forgot to save file - basenotification type rename ([#111](https://github.com/uzh-bf/gbl-uzh/issues/111)) ([59540ae](https://github.com/uzh-bf/gbl-uzh/commit/59540ae6cfcdaf70cc06206f0a56fb7cb15e862a))

### [0.4.29](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.28...v0.4.29) (2025-06-21)

### [0.4.28](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.27...v0.4.28) (2025-06-20)


### Features

* **platform:** add other segment end results of other teams + action subscription ([#108](https://github.com/uzh-bf/gbl-uzh/issues/108)) ([67dd6c8](https://github.com/uzh-bf/gbl-uzh/commit/67dd6c8858bc543de3702ceb1398c5eb33e899df))


### Bug Fixes

* **platform:** make sure period_start result has segment index for results before se… ([#107](https://github.com/uzh-bf/gbl-uzh/issues/107)) ([b961db7](https://github.com/uzh-bf/gbl-uzh/commit/b961db74729b4164598170c671947169a3b837a6))

### [0.4.27](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.26...v0.4.27) (2025-06-04)


### Features

* **platform:** sse improvements ([#106](https://github.com/uzh-bf/gbl-uzh/issues/106)) ([cfa4257](https://github.com/uzh-bf/gbl-uzh/commit/cfa4257f9f92c152548a6ec912025dcac65332bd))


### Bug Fixes

* **platform:** sse: make sure cookies etc are allowed to be send for sse ([#105](https://github.com/uzh-bf/gbl-uzh/issues/105)) ([ec3e202](https://github.com/uzh-bf/gbl-uzh/commit/ec3e20236b3cc1aa1b353336e11891c01c239eaa))

### [0.4.26](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.25...v0.4.26) (2025-05-28)


### Features

* **platform:** subscriptions to global events ([#103](https://github.com/uzh-bf/gbl-uzh/issues/103)) ([d4672ac](https://github.com/uzh-bf/gbl-uzh/commit/d4672acdfca072ea137f85d50b6755120143e09b))

### [0.4.25](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.24...v0.4.25) (2025-05-14)


### Features

* **platform:** query game info in player data ([#104](https://github.com/uzh-bf/gbl-uzh/issues/104)) ([9910605](https://github.com/uzh-bf/gbl-uzh/commit/9910605b6610128a2821492045895f825f98de08))

### [0.4.24](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.23...v0.4.24) (2025-04-25)


### Features

* **platform:** adding playerId to payload action reducer ([#102](https://github.com/uzh-bf/gbl-uzh/issues/102)) ([bf6f741](https://github.com/uzh-bf/gbl-uzh/commit/bf6f7412c49ad39500bf3f76e25aecbec9a3d790))

### [0.4.23](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.22...v0.4.23) (2025-04-25)


### Features

* **platform:** add periodIx, segmentIx and segmentCount to payload of action reducer ([#101](https://github.com/uzh-bf/gbl-uzh/issues/101)) ([f9bb0e4](https://github.com/uzh-bf/gbl-uzh/commit/f9bb0e4d97b6eecb67692aa73b2b49531ad9e965))

### [0.4.22](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.21...v0.4.22) (2025-04-14)


### Features

* **platform:** Adding game facts for global updates ([#98](https://github.com/uzh-bf/gbl-uzh/issues/98)) ([018a458](https://github.com/uzh-bf/gbl-uzh/commit/018a4580d23f40e82e1e604204d1a53ddc351db5))


### Bug Fixes

* **platform:** update game facts during prep/pause except very first one ([#100](https://github.com/uzh-bf/gbl-uzh/issues/100)) ([a31b604](https://github.com/uzh-bf/gbl-uzh/commit/a31b6043b50b5e376b260bb6271e5095422b7204))

### [0.4.21](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.20...v0.4.21) (2025-04-07)

### [0.4.20](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.19...v0.4.20) (2025-04-03)


### Bug Fixes

* **platform:** adding segments in activePeriod game request ([#95](https://github.com/uzh-bf/gbl-uzh/issues/95)) ([f95bc7b](https://github.com/uzh-bf/gbl-uzh/commit/f95bc7b4fb35129ef48191aaf6b7a939c9d47c72))

### [0.4.19](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.18...v0.4.19) (2025-04-03)


### Bug Fixes

* **platform:** use segments[0] of activePeriod instead of activeSegment for initialize ([#91](https://github.com/uzh-bf/gbl-uzh/issues/91)) ([27dacc6](https://github.com/uzh-bf/gbl-uzh/commit/27dacc64ff5f3ececb9a935152145f30d722d354))


### Build and CI

* add Azure Static Web Apps workflow file ([871b4bb](https://github.com/uzh-bf/gbl-uzh/commit/871b4bb3154573cc82d65ba4b2415ee50f26146e))

### [0.4.18](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.17...v0.4.18) (2025-02-11)


### Bug Fixes

* **apps/demo-game:** bug ordering of types in PayloadPeriodResult ([#88](https://github.com/uzh-bf/gbl-uzh/issues/88)) ([b576abe](https://github.com/uzh-bf/gbl-uzh/commit/b576abed8e24829d5ae4de1d64a12fc52601a08d))


### Other

* **feat:** on delete cascade for playeractions ([#89](https://github.com/uzh-bf/gbl-uzh/issues/89)) ([7a3501c](https://github.com/uzh-bf/gbl-uzh/commit/7a3501c0b509dfc84f3a6074d20ca24bc8cd3f08))
* **quartz:** make dev new default submodule of quartz ([#87](https://github.com/uzh-bf/gbl-uzh/issues/87)) ([ef39b6e](https://github.com/uzh-bf/gbl-uzh/commit/ef39b6eda9cf9c81a5989406a6df3346c955c5d8))

### [0.4.17](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.16...v0.4.17) (2025-01-28)


### Bug Fixes

* **platform:** updating onDelete:Cascade for some relations in prisma schema ([#86](https://github.com/uzh-bf/gbl-uzh/issues/86)) ([b7b9711](https://github.com/uzh-bf/gbl-uzh/commit/b7b97111b56bceb6d6dfdae9a819db88dfb7f128))

### [0.4.16](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.15...v0.4.16) (2025-01-15)


### Build and CI

* publish only to NPM for now ([187b64d](https://github.com/uzh-bf/gbl-uzh/commit/187b64d7cf65c3037b0eeae221239a176862f6ff))

### [0.4.15](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.14...v0.4.15) (2025-01-15)


### Build and CI

* update how platform release gets working directory ([10ca0a9](https://github.com/uzh-bf/gbl-uzh/commit/10ca0a9bb76f9091acb9f5156625809e77084f04))

### [0.4.14](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.13...v0.4.14) (2025-01-15)


### Features

* add expectations to student decision page ([#69](https://github.com/uzh-bf/gbl-uzh/issues/69)) ([82e2dac](https://github.com/uzh-bf/gbl-uzh/commit/82e2dac3f025304fa7ddfd563cb415cd6d724ea1))
* **demo-game:** add dice page to visualize random development ([#68](https://github.com/uzh-bf/gbl-uzh/issues/68)) ([40c5d37](https://github.com/uzh-bf/gbl-uzh/commit/40c5d37ef97417f8d9de4386653b100a5c1ff497))
* **demo-game:** add period end reports and charts for admin, improve player welcome page default values and better loading, improve build process, upgrade dependencies ([#66](https://github.com/uzh-bf/gbl-uzh/issues/66)) ([b4cb4dd](https://github.com/uzh-bf/gbl-uzh/commit/b4cb4dd140906fc570a78a3404b79c3a9a45d0d3))
* **demo-game:** add story elements ([#54](https://github.com/uzh-bf/gbl-uzh/issues/54)) ([944fc6d](https://github.com/uzh-bf/gbl-uzh/commit/944fc6d046ce32090c859ff0f863760793f48a89))
* **demo-game:** display period settings on admin page ([#74](https://github.com/uzh-bf/gbl-uzh/issues/74)) ([cdf2d04](https://github.com/uzh-bf/gbl-uzh/commit/cdf2d0479b6461de831a53990e8dc1659b7213cc))
* **demo-game:** fixing and improving pause state in player window ([#71](https://github.com/uzh-bf/gbl-uzh/issues/71)) ([5c4d392](https://github.com/uzh-bf/gbl-uzh/commit/5c4d3920e1a05a5d120f2976b01ca48825baccf6))
* **demo-game:** improve reports page ([#70](https://github.com/uzh-bf/gbl-uzh/issues/70)) ([a00add7](https://github.com/uzh-bf/gbl-uzh/commit/a00add77d8916cf696dbb47b7addf1590b0cda22))
* **demo-game:** learning elements as modal ([#57](https://github.com/uzh-bf/gbl-uzh/issues/57)) ([14a6655](https://github.com/uzh-bf/gbl-uzh/commit/14a6655a0e148578b73a3a785ea728986413f77a))
* **demo-game:** risk-return and sharpe-ratio charts ([#73](https://github.com/uzh-bf/gbl-uzh/issues/73)) ([42d2e19](https://github.com/uzh-bf/gbl-uzh/commit/42d2e19709bd5e1cdd97284bde0ea5d03c87cc81))


### Bug Fixes

* **apps/website:** ensure build includes gamification advisor from correct path ([af8cb62](https://github.com/uzh-bf/gbl-uzh/commit/af8cb62de51aa3f01bcccf06a29d4d2e0d44de28))
* **apps/website:** escape room link to older url ([aca26c3](https://github.com/uzh-bf/gbl-uzh/commit/aca26c389460e6ea08afca93d1014dd0ef982e9a))
* **apps/website:** export should include kb ([fa34cbb](https://github.com/uzh-bf/gbl-uzh/commit/fa34cbbd5ba7e02d53b9787fb7b735c3cc2b6721))
* **apps/website:** fixed 500px height for image modal ([2b16bd3](https://github.com/uzh-bf/gbl-uzh/commit/2b16bd389c57097b10bb0468727f36712d5f8b53))
* **apps/website:** remove forms embed ([7492df4](https://github.com/uzh-bf/gbl-uzh/commit/7492df4e358c1499330075c83f18464223b47510))
* **apps/website:** update website build to use quartz kb and ensure initialPath links works ([d0dc38d](https://github.com/uzh-bf/gbl-uzh/commit/d0dc38d5f7e8fc26aade8c1f3b2f952c32838f6b))
* casing for titles of cards ([62b0725](https://github.com/uzh-bf/gbl-uzh/commit/62b0725a59b95438c34ae0cf9d856019227a430a))
* cockpit period select initialization, responsiveness of charts ([4dde721](https://github.com/uzh-bf/gbl-uzh/commit/4dde721f663502e7ec461cfec8eb6fafc394a945))
* computation of sharpe based on bank benchmark value ([3dd6c27](https://github.com/uzh-bf/gbl-uzh/commit/3dd6c27ba1aa66aecb97be2d2871d5609aa52a78))
* **demo-game:** Formik ManageGame ([#80](https://github.com/uzh-bf/gbl-uzh/issues/80)) ([61458b3](https://github.com/uzh-bf/gbl-uzh/commit/61458b3b46128731798100e13d9ddb201618f3a5))
* **demo-game:** move useCallback above if conditions ([7bf965a](https://github.com/uzh-bf/gbl-uzh/commit/7bf965aed261b8bbbc8fd9d1201ade7b1ed8d432))
* **demo-game:** Transaction to Decision History + Fix segment result service ([#65](https://github.com/uzh-bf/gbl-uzh/issues/65)) ([bd129fd](https://github.com/uzh-bf/gbl-uzh/commit/bd129fda0945a26afe07935f9f2d2e26e46cbd5f))
* ops build with pnpm ([635a2fd](https://github.com/uzh-bf/gbl-uzh/commit/635a2fd4c0220e93881c7cfb20c2b3355a1213f0))
* prettier ([2b61d4d](https://github.com/uzh-bf/gbl-uzh/commit/2b61d4d2f4a5a0d36e3743e3ec047b487e10f274))
* prevent possibility of not investing in anything ([3c4ab92](https://github.com/uzh-bf/gbl-uzh/commit/3c4ab922cf7a50ef4188a47940e5f99644ce4a01))


### Dependencies

* upgrade turbo ([54bfbbf](https://github.com/uzh-bf/gbl-uzh/commit/54bfbbfa660c1df845e495babbb61a624280f3bd))


### Refactors

* **demo-game:** clean up cockpit - moved calculations into respective game states ([#51](https://github.com/uzh-bf/gbl-uzh/issues/51)) ([bae5d20](https://github.com/uzh-bf/gbl-uzh/commit/bae5d20c2b11f9047c4278b881d56e92ce8359e4))


### Enhancements

* add new use cases ([ab2b74a](https://github.com/uzh-bf/gbl-uzh/commit/ab2b74a259fdc86fe53a1af1284de084e5d24e98))
* **apps/website:** add contents for EscapeUZH ([#26](https://github.com/uzh-bf/gbl-uzh/issues/26)) ([5f704c5](https://github.com/uzh-bf/gbl-uzh/commit/5f704c58830435e5503af5a3b30d381613bf2b3a))
* **apps/website:** add external games and make external links work within cards ([#38](https://github.com/uzh-bf/gbl-uzh/issues/38)) ([55f38f3](https://github.com/uzh-bf/gbl-uzh/commit/55f38f32e251b90f97c25e2414aff48cbe686482))
* **apps/website:** add tags for competencies on about page ([#35](https://github.com/uzh-bf/gbl-uzh/issues/35)) ([d62b13d](https://github.com/uzh-bf/gbl-uzh/commit/d62b13d7eff4495285f362cbb1f576b87f7a99c4))
* **demo-game:** add docker build workflow and improve dockerfile ([#67](https://github.com/uzh-bf/gbl-uzh/issues/67)) ([1ff8b92](https://github.com/uzh-bf/gbl-uzh/commit/1ff8b92403021ff921a69d8f0068b928a4ab4772))
* **demo-game:** add player avatars, small enhancements, adding images, better layout ([#72](https://github.com/uzh-bf/gbl-uzh/issues/72)) ([095ca91](https://github.com/uzh-bf/gbl-uzh/commit/095ca918b34a18eb99494bff82e7e85153faea18))
* improve demo-game admin ui, add recharts for visualization between segments, update dependencies, fix dev mode and integration with UI package CSS ([#46](https://github.com/uzh-bf/gbl-uzh/issues/46)) ([640fe42](https://github.com/uzh-bf/gbl-uzh/commit/640fe42021db03f004b7cf1ba2121a1f6e4ea040))
* improve use case overview page ([59d7719](https://github.com/uzh-bf/gbl-uzh/commit/59d7719170d5cb1e74d22cf43495aec6ccea5e3e))
* other improvements and misc fixes ([0eaa969](https://github.com/uzh-bf/gbl-uzh/commit/0eaa969a5016e13ae412cbc5cfe814c179f694d8))
* story elements with visualizations ([901c7e2](https://github.com/uzh-bf/gbl-uzh/commit/901c7e20d1fe1d59250eda5fec19f74f9d9442c8))


### Other

* add escape-uzh redirect ([8b6cb9c](https://github.com/uzh-bf/gbl-uzh/commit/8b6cb9c0a4e01e92d9f4462466f506e0a8f0d303))
* add global prisma:setup command ([733120a](https://github.com/uzh-bf/gbl-uzh/commit/733120adb78caeb1a869b025aa32ec7a9cc120ab))
* add jakob to about page and update links to DF ([#29](https://github.com/uzh-bf/gbl-uzh/issues/29)) ([5f80afc](https://github.com/uzh-bf/gbl-uzh/commit/5f80afce2ab4d7e89027330872ebfcd8e0c052ef))
* add seed:stg command ([322823b](https://github.com/uzh-bf/gbl-uzh/commit/322823ba25b8d5994b948bab7a7a86a9de85bcb9))
* add stub files for new gbl ui framework (packages/ui)  ([#42](https://github.com/uzh-bf/gbl-uzh/issues/42)) ([06e1ee2](https://github.com/uzh-bf/gbl-uzh/commit/06e1ee21a7810a93f0077e0f5c2d90a88ca8b719))
* **apps/website:** add escape room diary ([51db8ae](https://github.com/uzh-bf/gbl-uzh/commit/51db8aebbdba1c9a356c0cc9a669915a29f63849))
* **apps/website:** add escape room materials to public folder ([10c8e61](https://github.com/uzh-bf/gbl-uzh/commit/10c8e61501d4d07d735c1d8a61ef3505fae58d43))
* **apps/website:** add gbl seminar ([6ac493c](https://github.com/uzh-bf/gbl-uzh/commit/6ac493c82f2680da3af14bfa07652b9306c4b315))
* **apps/website:** use UZH logo for header, reduce orange ([#36](https://github.com/uzh-bf/gbl-uzh/issues/36)) ([82ebefd](https://github.com/uzh-bf/gbl-uzh/commit/82ebefdebaf8f8303481edc20ba1a5253873f58b))
* change platform package to ESM ([316c01b](https://github.com/uzh-bf/gbl-uzh/commit/316c01b0731fd97ddd2893b57a987572c15318f3))
* **ci:** adding workflow for platform release ([#84](https://github.com/uzh-bf/gbl-uzh/issues/84)) ([cbd35b5](https://github.com/uzh-bf/gbl-uzh/commit/cbd35b5784f16d6935752edf9e1013a11f8a54f7))
* improve sidebar ([43b7c0b](https://github.com/uzh-bf/gbl-uzh/commit/43b7c0bee5323299a6ceb97f23ac833da116cc72))
* improve UC sidebar ([0953761](https://github.com/uzh-bf/gbl-uzh/commit/09537613f72cedd1f94160b7aae1ea9d2b945cce))
* integrate new quartz submodule ([773a73c](https://github.com/uzh-bf/gbl-uzh/commit/773a73c51b8c2f2101e9aa8a0b730c6b05751502))
* kb update ([a0240e8](https://github.com/uzh-bf/gbl-uzh/commit/a0240e823c09bde81beccf39e51312574ce58a87))
* kb update ([eed9807](https://github.com/uzh-bf/gbl-uzh/commit/eed98076704b7373a3b45c08f4d0deb930079fc0))
* lockfile ([4554253](https://github.com/uzh-bf/gbl-uzh/commit/4554253587b75c2daa8a18dc3df9c78750f4f478))
* lockfile maintenance ([a18c868](https://github.com/uzh-bf/gbl-uzh/commit/a18c868f92e5a0a92b6544d645bcfe7409b0eba3))
* lockfile maintenance ([d1e409a](https://github.com/uzh-bf/gbl-uzh/commit/d1e409a797c44980b28adb55fdab334adaf6bc03))
* lockfile maintenance ([20171e5](https://github.com/uzh-bf/gbl-uzh/commit/20171e53ab6d345604e99f1001aabfdb7fd4517a))
* lockfile maintenance ([ee80a4a](https://github.com/uzh-bf/gbl-uzh/commit/ee80a4a8a70c541393d6716e0dba9d8f8a3770eb))
* lockfile maintenance ([9c0d01e](https://github.com/uzh-bf/gbl-uzh/commit/9c0d01e9599294bdeb1eafaa01e4eefcd1c7295d))
* lockfile maintenance ([3b0cb7a](https://github.com/uzh-bf/gbl-uzh/commit/3b0cb7a2ff4adcb1d967ba6595c2451aae4cb4dd))
* lockfile maintenance ([c413fc2](https://github.com/uzh-bf/gbl-uzh/commit/c413fc23aaa85341254e9241ccb9dcf2f2f002f3))
* move _run script and compose file to demo-game app ([88f70a9](https://github.com/uzh-bf/gbl-uzh/commit/88f70a95accab6f7c5f4a4c529cf78da184b3396))
* nodemon for dev ([cf2b40b](https://github.com/uzh-bf/gbl-uzh/commit/cf2b40b326eafbfa427ccf6468ac68ff9646359b))
* pnpm ([978bb86](https://github.com/uzh-bf/gbl-uzh/commit/978bb8676c2d04443f4fcebfc204afb7c58a483b))
* remove old kb submodule ([c5f74cc](https://github.com/uzh-bf/gbl-uzh/commit/c5f74cc1c16038e56006bd4016f17df785b37c02))
* run format on entire repo ([919dac4](https://github.com/uzh-bf/gbl-uzh/commit/919dac4ff577b14d6738e603cc906d4f18204f8a))
* submodule maintenance ([e668168](https://github.com/uzh-bf/gbl-uzh/commit/e66816882f0e5a8574a88bd8681d0b4e0c46c66c))
* submodule maintenance ([d89e53b](https://github.com/uzh-bf/gbl-uzh/commit/d89e53bb940144c68f50c26bc4135b7772c74c1a))
* submodule update ([7b4f475](https://github.com/uzh-bf/gbl-uzh/commit/7b4f475829266eda75af807797ce4665c344dbc3))
* update images for startinvest and business sim ([b8f0a69](https://github.com/uzh-bf/gbl-uzh/commit/b8f0a69831b92666ebd721ae80f4e937dfd142f6))
* update license copyright statements ([7ff9703](https://github.com/uzh-bf/gbl-uzh/commit/7ff97039b43f5c9b564ddaa92f52384198fd1bd6))
* update quartz ([3c03a4e](https://github.com/uzh-bf/gbl-uzh/commit/3c03a4e85a21dfd068334a8b9704e3b443195772))
* update tsconfig files and change platform to ESM ([#49](https://github.com/uzh-bf/gbl-uzh/issues/49)) ([0f569c9](https://github.com/uzh-bf/gbl-uzh/commit/0f569c9373611fcc32bf5136344d6cee0a8303d7))
* update turbo outputs to include public folder in quartz ([549ad7b](https://github.com/uzh-bf/gbl-uzh/commit/549ad7b32d51b619814c66cce2378f2a260bef45))
* upgrade nextjs, add startinvest ([97f227b](https://github.com/uzh-bf/gbl-uzh/commit/97f227b0b666d0f457b2a223f973311a7fbf77b9))

### [0.4.13](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.12...v0.4.13) (2023-09-06)


### Bug Fixes

* builds with tsconfig settings ([c0a0314](https://github.com/uzh-bf/gbl-uzh/commit/c0a0314e4baedae00b83bd3ae1b31c7c1fd16e6f))
* issues with title tag, clarity of tags on game overview ([23309df](https://github.com/uzh-bf/gbl-uzh/commit/23309df68d2af0c4d10700e9f4cdd8474e57fee3))


### Other

* install syncpack and format package.json consistently ([830b1f7](https://github.com/uzh-bf/gbl-uzh/commit/830b1f784639a0815c2e692451593c47248c3356))
* lockfile maintenance ([3747648](https://github.com/uzh-bf/gbl-uzh/commit/37476485c504d597b821cc31c3f67f3f69a2ad3c))


### Dependencies

* fix mismatches ([783e213](https://github.com/uzh-bf/gbl-uzh/commit/783e213519b44385d5f4b950e765b1874ad7a1a6))
* syncpack fix ([ec2d6bc](https://github.com/uzh-bf/gbl-uzh/commit/ec2d6bcc7da53a73a28cbbd4b722a3bad72cc13b))

### [0.4.12](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.11...v0.4.12) (2023-07-07)


### Features

* addCountdown ([b594397](https://github.com/uzh-bf/gbl-uzh/commit/b5943977699c912ce6f2511f1eb82a013dd9dc0d))


### Other

* lockfile maintenance ([0668423](https://github.com/uzh-bf/gbl-uzh/commit/0668423a73955a5af915e44df684261478966d97))

### [0.4.11](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.10...v0.4.11) (2023-07-06)


### Bug Fixes

* add number to player and order by it ([809848b](https://github.com/uzh-bf/gbl-uzh/commit/809848b2c7131f0299a1d0bd76c1bfda64bd62f3))
* **platform:** add number to Player in graphql type ([18a9917](https://github.com/uzh-bf/gbl-uzh/commit/18a99173ac4cb65389ed0c40712561ed310f3e61))
* **platform:** assign the player number on creating a game ([bc4517f](https://github.com/uzh-bf/gbl-uzh/commit/bc4517f0d6278057899f2c57f6f492354528ac6b))

### [0.4.10](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.9...v0.4.10) (2023-07-05)


### Bug Fixes

* **platform:** get player transactions in ascending order ([489cf10](https://github.com/uzh-bf/gbl-uzh/commit/489cf106ca32d849b4f16c9c2766b4d3aacb81d0))

### [0.4.9](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.8...v0.4.9) (2023-07-05)


### Bug Fixes

* **platform:** order player transactions by creation date ([aee35e8](https://github.com/uzh-bf/gbl-uzh/commit/aee35e8ac37a33257b60ecf7b9ed1ae31fb71ffd))
* **platform:** order transactions by creation date ([e26920d](https://github.com/uzh-bf/gbl-uzh/commit/e26920ddf4918c9e086f1828e4133b480b45c929))


### Other

* lockfile maintenance ([04acba1](https://github.com/uzh-bf/gbl-uzh/commit/04acba1f6f5dcf08a9b7b45e54503e59a993f31c))

### [0.4.8](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.7...v0.4.8) (2023-07-05)


### Other

* regenerate files ([4bf68a1](https://github.com/uzh-bf/gbl-uzh/commit/4bf68a10a5d83a51a8e44cb4df4b49a44d0c8bc7))

### [0.4.7](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.6...v0.4.7) (2023-07-05)


### Bug Fixes

* **platform:** add logout mutation ([6024d31](https://github.com/uzh-bf/gbl-uzh/commit/6024d319a8f37ed4896274cf785db5f434a4dc92))
* **platform:** add mutation to logout as team ([111e15e](https://github.com/uzh-bf/gbl-uzh/commit/111e15e28e52896a302dffcca3c41eabedcb3a59))
* **platform:** ensure logout does not break if not logged in ([a78e7c7](https://github.com/uzh-bf/gbl-uzh/commit/a78e7c77985cd88a37242fa999cd734823c489a9))
* **platform:** logoutAsTeam ([8a8bfef](https://github.com/uzh-bf/gbl-uzh/commit/8a8bfef60abe8b182231dd81915cb8fe0c810acf))
* **platform:** make contentRole a JSON object to return unstructured ([48183c4](https://github.com/uzh-bf/gbl-uzh/commit/48183c467b52a0cb5e619cb5b9b19990c5175b79))


### Other

* lockfile maintenance ([c1cc313](https://github.com/uzh-bf/gbl-uzh/commit/c1cc3137c1024103172448e5537b4245375d29b8))

### [0.4.6](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.5...v0.4.6) (2023-07-02)


### Bug Fixes

* learning elements completion ([896a006](https://github.com/uzh-bf/gbl-uzh/commit/896a0061027bcdb6853c2dcebbc0345394a2d2d2))
* push story element ids ([d418f04](https://github.com/uzh-bf/gbl-uzh/commit/d418f04596756513b94389c83cb1a3ff085e3eb1))

### [0.4.5](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.4...v0.4.5) (2023-07-02)


### Bug Fixes

* make the team name generic and assign team numbers per default ([efb3410](https://github.com/uzh-bf/gbl-uzh/commit/efb3410ab17c1140beb8230cf0cda4d94cbd2c8b))


### Dependencies

* lockfile maintenance ([aa35400](https://github.com/uzh-bf/gbl-uzh/commit/aa35400afd7617e0fcadc41e0ca85c8257a43d82))
* minor upgrades ([243cae6](https://github.com/uzh-bf/gbl-uzh/commit/243cae6b8aee4d7b6ffcc21de309e0c3ab25d892))

### [0.4.4](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.3...v0.4.4) (2023-06-28)


### Dependencies

* back to older nanoid package in platform ([d755d29](https://github.com/uzh-bf/gbl-uzh/commit/d755d29e46c9711076646424c334fc77ae67c9ac))

### [0.4.3](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.2...v0.4.3) (2023-06-28)


### Other

* lockfile maintenance ([f4682fc](https://github.com/uzh-bf/gbl-uzh/commit/f4682fc8a010701f31fdfde131da4783810cbd7e))
* rebuild demo-game ([fecfe2c](https://github.com/uzh-bf/gbl-uzh/commit/fecfe2c7f3354d6d4a280ef37ef700223a27cd00))


### Dependencies

* install nanoid ([643c0d8](https://github.com/uzh-bf/gbl-uzh/commit/643c0d8e97642102ffe8e1d92451c129911bef65))

### [0.4.2](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.1...v0.4.2) (2023-06-28)


### Bug Fixes

* add location to the past results query ([a7438d1](https://github.com/uzh-bf/gbl-uzh/commit/a7438d16ed61d2ded46475c3369664c62c33b818))
* destroy cookie and set a new one when logging in as a team ([757f7d6](https://github.com/uzh-bf/gbl-uzh/commit/757f7d6a579ac08641e18a192b84ecfea3ecc18a))
* **packages/platform:** ensure ctx.user is not used if undefined ([bdbab69](https://github.com/uzh-bf/gbl-uzh/commit/bdbab696cb6e3cad4437b6615cd93a237945830c))
* **packages/platform:** include segment when fetching previous results ([16e6c30](https://github.com/uzh-bf/gbl-uzh/commit/16e6c30956f9b2d85310ac38a623bc4565da66e2))
* **platform:** use typeof game.activePeriodIx in util ([cf330ef](https://github.com/uzh-bf/gbl-uzh/commit/cf330ef3c6d8ada33451a861e40f7876f6e1b9f4))


### Refactors

* move period and segment status computations to platform utils ([248c525](https://github.com/uzh-bf/gbl-uzh/commit/248c52575af959fbeab3bdd51123f69bcc2929a1))


### Dependencies

* upgrade outdated packages and add graphql-sse ([cdc4ea0](https://github.com/uzh-bf/gbl-uzh/commit/cdc4ea07c85c338c1e9f28c031067a537658f725))
* upgrade packages ([dfc2925](https://github.com/uzh-bf/gbl-uzh/commit/dfc2925486292a1e60a84e82fa2ac42f99dec0fc))
* upgrade packages in demo game ([9c459ad](https://github.com/uzh-bf/gbl-uzh/commit/9c459ad2858cc793f891b8fef5612988c79cb89d))


### Enhancements

* setup cypress with basic admin login flow ([1e8d9d3](https://github.com/uzh-bf/gbl-uzh/commit/1e8d9d3f4b5ba707e2b34ad0f512603024b8ad31))
* use graphql-sse in the apollo link ([96c7f2b](https://github.com/uzh-bf/gbl-uzh/commit/96c7f2b1e5ef1b9bae3556e2c92a7f44d8671798))


### Other

* fetch segment in past results query ([e40c148](https://github.com/uzh-bf/gbl-uzh/commit/e40c148f0cd200af842e39a0ecff56a6b6e1c0e8))
* lockfile maintenance ([2179989](https://github.com/uzh-bf/gbl-uzh/commit/2179989dfbd872ffe14822da59c18a802120ed22))
* remove prisma extension that is now included by default ([5bbdf2f](https://github.com/uzh-bf/gbl-uzh/commit/5bbdf2f1a99fd573eaaee9113190f5d7befa604d))

### [0.4.1](https://github.com/uzh-bf/gbl-uzh/compare/v0.4.0...v0.4.1) (2023-06-19)


### Bug Fixes

* font import ([78246ef](https://github.com/uzh-bf/gbl-uzh/commit/78246ef236835c341a2ab68c9d1e2a7cdfefdb9e))


### Dependencies

* update graphql-yoga peer dep ([f1d7867](https://github.com/uzh-bf/gbl-uzh/commit/f1d7867192e613ed2eaa310694b5795544eabea1))
* upgrade outdated prisma ([c565a24](https://github.com/uzh-bf/gbl-uzh/commit/c565a24af022682469076172018611d338d5aa96))


### Other

* update contributors ([9efcdab](https://github.com/uzh-bf/gbl-uzh/commit/9efcdab0ba7f6894c0b2a77e4323b98bb234dd43))

## [0.4.0](https://github.com/uzh-bf/gbl-uzh/compare/v0.3.1...v0.4.0) (2023-06-19)


### Features

* add cypress testing stack for demo game ([#25](https://github.com/uzh-bf/gbl-uzh/issues/25)) ([c46e46e](https://github.com/uzh-bf/gbl-uzh/commit/c46e46ef8cf621319ecebb20fdd200e32e4dbc97))


### Bug Fixes

* **apps/website:** update build ([5a0c4be](https://github.com/uzh-bf/gbl-uzh/commit/5a0c4be47c82e514eb18c81d39e71c38a4dc0041))
* **platform:** ensure periods with dynamic segment count can be closed ([9197c90](https://github.com/uzh-bf/gbl-uzh/commit/9197c90028cbb107772ecf3a37fb1ad9f99f8c90))
* **platform:** join player level when getting results ([a6d01da](https://github.com/uzh-bf/gbl-uzh/commit/a6d01da2d9723a3a16dd9471d809710d74951b5e))


### Enhancements

* **apps/website:** rework use case index page layout ([636fca8](https://github.com/uzh-bf/gbl-uzh/commit/636fca82f613d6c25385a44530f30f62245be313))


### Dependencies

* add winston for logging in platform ([3663753](https://github.com/uzh-bf/gbl-uzh/commit/36637536042075c032eb4e9ad95cc73359ebed15))
* **website:** upgrade next ([876a535](https://github.com/uzh-bf/gbl-uzh/commit/876a535275d40d49e9924a5055123d51742749a0))


### Other

* add .env to gitignore ([f0d8b6c](https://github.com/uzh-bf/gbl-uzh/commit/f0d8b6c109ed4bc5f4b227b436cae5c328d30436))
* **apps/demo-game:** add instructions to .env.local.template ([f1b04ac](https://github.com/uzh-bf/gbl-uzh/commit/f1b04ac8d0d2fef7c37904d07582efacf9ae9b49))
* **apps/website:** add forms and area for requesting the addition of games (also external) ([59b768d](https://github.com/uzh-bf/gbl-uzh/commit/59b768df626937253f98562a59046fc244570d79))
* **apps/website:** add melina to team page, update david image ([37e5754](https://github.com/uzh-bf/gbl-uzh/commit/37e5754447037be365280f4cbcf6882d9c0af80c))
* **apps/website:** move to native next/font ([51b8bd6](https://github.com/uzh-bf/gbl-uzh/commit/51b8bd6752789060ac23b1f7233b3992fec04954))
* **kb:** update to latest state ([544fc43](https://github.com/uzh-bf/gbl-uzh/commit/544fc435df72369deaf6c7955bbd6f5a9035fef0))
* restructuring without nexus build and using public dir ([d44b928](https://github.com/uzh-bf/gbl-uzh/commit/d44b9284b333987a4845ccbd1996bd06adef2377))
* upgrade platform packages ([5343c0b](https://github.com/uzh-bf/gbl-uzh/commit/5343c0bdb092b254ab62041b7a3dd45a0df98f30))
* **website:** update team ([0ba7cd5](https://github.com/uzh-bf/gbl-uzh/commit/0ba7cd594455b13e222ba09e0e610a53c3fd7eec))

### [0.3.1](https://github.com/uzh-bf/gbl-uzh/compare/v0.3.0...v0.3.1) (2023-03-13)


### Deployment

* **apps/demo-game:** add basic dockerfile and fix prisma copy script to work in non-monorepo setting ([38f91e8](https://github.com/uzh-bf/gbl-uzh/commit/38f91e89bf45726b34f0a4f995c322a3a6b87f5f))
* **apps/demo-game:** fix docker build ([a70c13a](https://github.com/uzh-bf/gbl-uzh/commit/a70c13aff14cb6667f4808300c12236b626982c1))


### Other

* **apps/demo-game:** add production db commands ([7964295](https://github.com/uzh-bf/gbl-uzh/commit/796429524bff4a16cd43a908f812b2ca2b751751))
* new prisma setup and create initial migration ([21e06ae](https://github.com/uzh-bf/gbl-uzh/commit/21e06ae1dad6ad19cd70ebb5f1221a1af47fc17a))


### Dependencies

* upgrade all dependencies ([aeb2a41](https://github.com/uzh-bf/gbl-uzh/commit/aeb2a41c266a00725382c8ed8d4bbaba25e0c816))

## [0.3.0](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.10...v0.3.0) (2023-03-13)


### Features

* add initial @gbl-uzh/platform, website updates, and restructure as monorepo with separate licensing ([#19](https://github.com/uzh-bf/gbl-uzh/issues/19)) ([d2f1d25](https://github.com/uzh-bf/gbl-uzh/commit/d2f1d2512f689aa9f64875c9d4edf4d3214befe1))


### Bug Fixes

* **website:** add fonts css to globals.css ([e3275b5](https://github.com/uzh-bf/gbl-uzh/commit/e3275b510cfb9a747010b35c9bf2820bfca07f54))


### Dependencies

* upgrade minor stuff ([19107b2](https://github.com/uzh-bf/gbl-uzh/commit/19107b2df891531fdf6947e5f85efc6ed42bbc8d))
* upgrade standard-version and package.json metadata ([b47f613](https://github.com/uzh-bf/gbl-uzh/commit/b47f61343793aae7000cc74fd1982ebbd1a996cb))


### Other

* **kb:** submodule update ([3b242a1](https://github.com/uzh-bf/gbl-uzh/commit/3b242a13b89e68bc3120d9352ae78b88b49a19b2))
* submodule maintenance ([59a7392](https://github.com/uzh-bf/gbl-uzh/commit/59a7392066cf86c1d1329b9e910c19d9503b2160))
* update node version in volta ([03931e8](https://github.com/uzh-bf/gbl-uzh/commit/03931e89853a6dc70094c16f61d3187500f368f6))
* **website:** upgrade dependencies ([47e52f3](https://github.com/uzh-bf/gbl-uzh/commit/47e52f3462f6088d8726d6716f1638734328ddab))

### [0.2.14](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.13...v0.2.14) (2023-01-06)


### Bug Fixes

* advisor ([d53d3c6](https://github.com/uzh-bf/gbl-uzh/commit/d53d3c64dbd62644c34e3df02dcd00c72119480a))
* build graphql codegen ops in game instead of import platform ([a30fd88](https://github.com/uzh-bf/gbl-uzh/commit/a30fd8867e40ce9af509093403bca2acc8e8b0ae))
* **packages/platform:** allow null return in Game for players and periods ([dedb286](https://github.com/uzh-bf/gbl-uzh/commit/dedb28616edd7f999d11759827ad44250ab5024b))

### [0.2.13](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.12...v0.2.13) (2023-01-05)


### Bug Fixes

* **packages/platform:** embed graphql documents in platform dist ([89c5692](https://github.com/uzh-bf/gbl-uzh/commit/89c5692f1a4b08d76090ec538a41360e884eb3b0))


### Other

* **apps/demo-game:** name2 ([53a2e3d](https://github.com/uzh-bf/gbl-uzh/commit/53a2e3dc083bc7985d7a5e78f845fbb0008ea33b))
* lockfile maintenance ([806405c](https://github.com/uzh-bf/gbl-uzh/commit/806405c89181113b57eca0da6adeef7941b7b5d5))

### [0.2.12](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.11...v0.2.12) (2023-01-04)


### Other

* **apps/website:** upgrade packages and design system ([#20](https://github.com/uzh-bf/gbl-uzh/issues/20)) ([b904e60](https://github.com/uzh-bf/gbl-uzh/commit/b904e602a6cfa664ee749eddb68d45d309bff4a3))
* kb submodule ([82a2411](https://github.com/uzh-bf/gbl-uzh/commit/82a24119c00fab0052bc0318e7ff6c8bc95205d7))
* lockfile maintenance ([98743d1](https://github.com/uzh-bf/gbl-uzh/commit/98743d11b529622f27fc8d13fa3684691f546425))
* lockfile maintenance ([b154d67](https://github.com/uzh-bf/gbl-uzh/commit/b154d67ec54764c6215e79cf422f1a51c3068a98))
* submodule update ([bd2661c](https://github.com/uzh-bf/gbl-uzh/commit/bd2661cd625d2a63c79c265f5816ccc28277c038))

### [0.2.11](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.10...v0.2.11) (2022-11-13)


### Bug Fixes

* ts-node-dev ([6350145](https://github.com/uzh-bf/gbl-uzh/commit/6350145edd5fb98da88c36267cd53203a2a57cb6))
* **website:** add fonts css to globals.css ([e3275b5](https://github.com/uzh-bf/gbl-uzh/commit/e3275b510cfb9a747010b35c9bf2820bfca07f54))


### Dependencies

* upgrade minor stuff ([19107b2](https://github.com/uzh-bf/gbl-uzh/commit/19107b2df891531fdf6947e5f85efc6ed42bbc8d))
* upgrade standard-version and package.json metadata ([b47f613](https://github.com/uzh-bf/gbl-uzh/commit/b47f61343793aae7000cc74fd1982ebbd1a996cb))


### Other

* **kb:** submodule update ([3b242a1](https://github.com/uzh-bf/gbl-uzh/commit/3b242a13b89e68bc3120d9352ae78b88b49a19b2))
* submodule maintenance ([59a7392](https://github.com/uzh-bf/gbl-uzh/commit/59a7392066cf86c1d1329b9e910c19d9503b2160))
* update node version in volta ([03931e8](https://github.com/uzh-bf/gbl-uzh/commit/03931e89853a6dc70094c16f61d3187500f368f6))
* **website:** upgrade dependencies ([47e52f3](https://github.com/uzh-bf/gbl-uzh/commit/47e52f3462f6088d8726d6716f1638734328ddab))

### [0.2.10](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.9...v0.2.10) (2022-07-18)


### Bug Fixes

* **website:** ensure build works for games without gallery ([2d77b00](https://github.com/uzh-bf/gbl-uzh/commit/2d77b00db12ffb6fdc4fc619186672005f856fa4))

### [0.2.9](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.8...v0.2.9) (2022-07-18)


### Enhancements

* **website:** switch image gallery to [@uzh-bf](https://github.com/uzh-bf) Modal ([f0df9dd](https://github.com/uzh-bf/gbl-uzh/commit/f0df9dd395d8bf11f797938f67a50f5055cfc647))

### [0.2.8](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.7...v0.2.8) (2022-07-18)


### Bug Fixes

* ensure build works with node 16 downgrade ([8b6f07e](https://github.com/uzh-bf/gbl-uzh/commit/8b6f07ee11cb258d7715a1a179c1776f41a627c0))

### [0.2.7](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.6...v0.2.7) (2022-07-18)


### Features

* **website:** integrate with design system, rework layout, add new games ([f305735](https://github.com/uzh-bf/gbl-uzh/commit/f305735d4ab84d1f55ba6fb81283d2702bcb1b0b))


### Dependencies

* **website:** upgrade packages ([ba0459d](https://github.com/uzh-bf/gbl-uzh/commit/ba0459db5be00628f7422586d1ff7c1fcc863a35))


### Enhancements

* add community link ([855c122](https://github.com/uzh-bf/gbl-uzh/commit/855c122c1294ad4e73fb9f616556e09d071d2c07))
* **website:** integrate with @uzh-bf/design-system ([89dd237](https://github.com/uzh-bf/gbl-uzh/commit/89dd237ce9907f70dc9af70ba4bb0bca15b82b7e))


### Other

* add join community to banner ([19d2796](https://github.com/uzh-bf/gbl-uzh/commit/19d279605344b4cb7780c51d965ad41fdce31f35))
* install fontawesome ([3d46943](https://github.com/uzh-bf/gbl-uzh/commit/3d46943f2c7c5e885605eae741094090989c1ac4))
* kb submodule update ([3126bec](https://github.com/uzh-bf/gbl-uzh/commit/3126bec9d63dfa925731fdd5703f45afaec54b0f))
* submodule maintenance ([7878686](https://github.com/uzh-bf/gbl-uzh/commit/7878686c7d68c96f1ea84fcd82e83ea8bef018a0))
* submodule maintenance ([55c2822](https://github.com/uzh-bf/gbl-uzh/commit/55c28226beb254963bb9d8b49a6f56b4c93f81d3))
* submodule maintenance ([4456209](https://github.com/uzh-bf/gbl-uzh/commit/44562097cba0ea100a0d64833f7974130d4c2b82))

### [0.2.6](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.5...v0.2.6) (2022-04-06)


### Bug Fixes

* **website:** update typing issues ([96422ab](https://github.com/uzh-bf/gbl-uzh/commit/96422ab4d612ae16f9bb8bf3e6b16182848c6658))

### [0.2.5](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.4...v0.2.5) (2022-04-06)

### [0.2.4](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.3...v0.2.4) (2022-04-06)


### Enhancements

* **website:** small contentual changes on games ([c5a7b37](https://github.com/uzh-bf/gbl-uzh/commit/c5a7b379f6e47fbbb20c798b814730896f522cf3))

### [0.2.3](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.2...v0.2.3) (2022-04-06)


### Other

* **advisor:** adapt name for wizard ([8fb4a4e](https://github.com/uzh-bf/gbl-uzh/commit/8fb4a4eca47e2ea5a47227a1de8e271362d447bc))
* **kb:** update kb contents ([fc7c2ee](https://github.com/uzh-bf/gbl-uzh/commit/fc7c2eecdf08e08f48294dd4fddfa7498ad5175d))
* **website:** copy advisory outputs in export command ([fc7bff3](https://github.com/uzh-bf/gbl-uzh/commit/fc7bff330c313aa08164bc4053b8cb5ece1897b0))


### Enhancements

* **advisor:** add back link to footer ([e1724b5](https://github.com/uzh-bf/gbl-uzh/commit/e1724b5243ffed45655f1bdf3d3f7f91e44f1203))
* **website:** add link to BF UZH in footer ([7740d48](https://github.com/uzh-bf/gbl-uzh/commit/7740d48575ca589467e14c53451d3e9d1050f3a0))
* **website:** add links to uzh and swissuni in footer ([c95def6](https://github.com/uzh-bf/gbl-uzh/commit/c95def64b2d6302a4e4c2d9151504ba3a35bd766))
* **website:** dependency upgrades and small contentual changes ([6fb53bb](https://github.com/uzh-bf/gbl-uzh/commit/6fb53bb16b7d6f00372a1a66b8402c6fe0b45dc2))
* **website:** redirect /community to MS teams ([f014c24](https://github.com/uzh-bf/gbl-uzh/commit/f014c24d91f83da740b059056e63b8a92a06e009))

### [0.2.2](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.1...v0.2.2) (2021-12-10)


### Features

* add initial version of the advisor to the index page ([1fe0202](https://github.com/uzh-bf/gbl-uzh/commit/1fe0202a83489b07fd6998d0e9bf19b64f2fe616))
* **advisor:** add advisor in separate directory ([833c37c](https://github.com/uzh-bf/gbl-uzh/commit/833c37c2dd4142fe38054569cffe3765b4819b65))
* embed simple advisory example ([90ff0d5](https://github.com/uzh-bf/gbl-uzh/commit/90ff0d549aedf269373b042b26ae84edfcc73193))


### Bug Fixes

* **website:** enable matomo only if the env variables are available ([be59bc0](https://github.com/uzh-bf/gbl-uzh/commit/be59bc0648694ef04dbcbfe6ee314fe4d16befc2))
* **website:** replace apos with html entity ([5f01b4c](https://github.com/uzh-bf/gbl-uzh/commit/5f01b4ce94c575e0f92c7df61228ff2af184706f))
* **website:** use NEXT_PUBLIC_WITH_GBL_ADVISOR ([4952142](https://github.com/uzh-bf/gbl-uzh/commit/4952142110b34c461d695a46f98fb9e883ece226))


### Enhancements

* **website:** add an icon for the advisor ([12485f4](https://github.com/uzh-bf/gbl-uzh/commit/12485f4b064c54717f32c05d62ae1abf61f5d7d4))
* **website:** add tailwind and matomo to advisor ([924859b](https://github.com/uzh-bf/gbl-uzh/commit/924859bd6a27ce15555041b1c0107171caa89c59))


### Other

* update configs for matomo ([431f8be](https://github.com/uzh-bf/gbl-uzh/commit/431f8be7bcab96a5b1021718f478d54b0e717d8b))
* update kb ([b60d605](https://github.com/uzh-bf/gbl-uzh/commit/b60d6057271a3ce989b695e8d4a9bb347dcce7d0))
* **website:** add push events for advisor and dev workflow ([00562d5](https://github.com/uzh-bf/gbl-uzh/commit/00562d58a43d61b8dd9cd7e7580bc8d6405df566))
* **website:** deploy the advisor ([7aa1277](https://github.com/uzh-bf/gbl-uzh/commit/7aa1277d2e9f3b4b92bcfce6def605188ff212d2))
* **website:** switch to matomo for webstats.uzh.ch ([82c08b2](https://github.com/uzh-bf/gbl-uzh/commit/82c08b2f8f046c2e34666f41b7ca0e48a18d863c))
* **website:** update advisor ([6149da6](https://github.com/uzh-bf/gbl-uzh/commit/6149da6df6ecac853cf5c50bb3f1653a89fd2f37))


### Dependencies

* **website:** tailwind migrations ([f8d5f7a](https://github.com/uzh-bf/gbl-uzh/commit/f8d5f7a067915d581f71f025c6d4dd4d793407be))
* **website:** upgrade dependencies ([9960613](https://github.com/uzh-bf/gbl-uzh/commit/9960613669fc49ed9d42a640d4046dd4932a21ac))
* **website:** upgrade next ([e30603d](https://github.com/uzh-bf/gbl-uzh/commit/e30603d6a6d75c1e6b4fad592e42d11f4836c7e9))
* **website:** upgrade next ([66b44ce](https://github.com/uzh-bf/gbl-uzh/commit/66b44ce6d261db8dbe864d54e57942abafaed9ed))

### [0.2.1](https://github.com/uzh-bf/gbl-uzh/compare/v0.2.0...v0.2.1) (2021-10-29)


### Bug Fixes

* **website:** add quotes around openreplay ([d905e9a](https://github.com/uzh-bf/gbl-uzh/commit/d905e9a9eeb6e5be149db0d4c8fe36046160189d))
* **website:** add trailing slash ([0cc0763](https://github.com/uzh-bf/gbl-uzh/commit/0cc076344cf64b583a43b0aee58016d86943baa0))
* **website:** disable swc minify as it breaks the game detail pages ([4f6277a](https://github.com/uzh-bf/gbl-uzh/commit/4f6277a21821d97a65ec430c65a2ecd1eef4dc7e))
* **website:** update beta link to gbl-uzh ([0a71809](https://github.com/uzh-bf/gbl-uzh/commit/0a718094fb27afbcb3e81176a71eea6dffbf7ce5))


### Refactors

* **website:** adjust gtag according to official example ([7be8761](https://github.com/uzh-bf/gbl-uzh/commit/7be8761195134b33a600a904644121169a12e80c))


### Enhancements

* add semester and institution to courses on gbl in use ([995b3a1](https://github.com/uzh-bf/gbl-uzh/commit/995b3a152d7aa9ef9608b04115c01402f9b2c13d))
* **kb:** add new resources to KB ([5160206](https://github.com/uzh-bf/gbl-uzh/commit/5160206ab7738942af1bff12674043f23b958d56))
* **website:** add description option for course entries ([3523da7](https://github.com/uzh-bf/gbl-uzh/commit/3523da7ad985288ec595a58dbbd76c8a58a1d526))
* **website:** add links to detailed roadmaps ([8325294](https://github.com/uzh-bf/gbl-uzh/commit/8325294acbd7e4bb8555bd167fb1abb844574224))
* **website:** add openreplay integration ([eb23dd0](https://github.com/uzh-bf/gbl-uzh/commit/eb23dd06fdfd9d096dd5f6b915027141f22d10e9))
* **website:** ensure that scripts are loaded only if env variables are present ([bf51130](https://github.com/uzh-bf/gbl-uzh/commit/bf51130c9b9b0532da3fc01948da4782685013e4))
* **website:** extend footer contents with links to repo and feedbear ([a61f7da](https://github.com/uzh-bf/gbl-uzh/commit/a61f7da0a2d8ebbaa22f6559f58e9c1db0d92983))
* **website:** replace logo with new working draft ([bab2e88](https://github.com/uzh-bf/gbl-uzh/commit/bab2e882b1c9465f0bb914ebfd52022b3a791c03))
* **website:** update title prefix to GBL@UZH ([f1fa0e0](https://github.com/uzh-bf/gbl-uzh/commit/f1fa0e0d04e7aabf96d4860d5c973ecbb8049100))


### Other

* add cypress file to public folder ([8211d75](https://github.com/uzh-bf/gbl-uzh/commit/8211d75d1260f8203e8f366bd45300364362485d))
* **deps:** add volta pinning for node ([c937cd2](https://github.com/uzh-bf/gbl-uzh/commit/c937cd28626af9cec60daa1b90b874e244ab7c68))
* **deps:** lockfile maintenance ([36c30f8](https://github.com/uzh-bf/gbl-uzh/commit/36c30f8bc27136699375238e5462f34f99f412c0))
* **deps:** upgrade to nextjs 12 and upgrade other dependencies ([c703de8](https://github.com/uzh-bf/gbl-uzh/commit/c703de8d7b641a55562b2f2146e7c35c700cf191))
* **deps:** upgrade visx and react-markdown ([ae4165f](https://github.com/uzh-bf/gbl-uzh/commit/ae4165ff5a2410273ab27b84f3117844dc0df61d))
* **kb:** update submodule ([17e4736](https://github.com/uzh-bf/gbl-uzh/commit/17e473673a6101fed7adcbb8568a3b9865b7cfa6))
* remove cruft .nvmrc ([7a233e4](https://github.com/uzh-bf/gbl-uzh/commit/7a233e4a1cbe17c909ed81c7da6eb7395009e72e))
* remove npm from global setup ([8bf5bad](https://github.com/uzh-bf/gbl-uzh/commit/8bf5badc9d0e6e4f7d7aa4504dce35732d0ff60a))
* update kb ([0420a2f](https://github.com/uzh-bf/gbl-uzh/commit/0420a2f26cd4fb89ee171dc28059e6cd8e5b233f))
* **website:** lockfile maintenance ([6af68af](https://github.com/uzh-bf/gbl-uzh/commit/6af68afdbd3c09a069d5ad9e375aa8f155c3c695))
* **website:** remove visx ([aac1987](https://github.com/uzh-bf/gbl-uzh/commit/aac1987dc1447147bf18a955a6cc3ef28e86cd3d))
* **website:** update export script to not optimize images ([69f7194](https://github.com/uzh-bf/gbl-uzh/commit/69f7194da5d38afd44d2bd2017be7b26c51add73))

## [0.2.0](https://github.com/uzh-bf/gbl-uzh/compare/v0.1.0...v0.2.0) (2021-10-26)


### Features

* added arrows to switch between images in zoomed view ([e5b40a3](https://github.com/uzh-bf/gbl-uzh/commit/e5b40a30bccde92f68062e8302e66c292933822a))
* added gallery to game detail pages ([3923a82](https://github.com/uzh-bf/gbl-uzh/commit/3923a82d9f48a7d0360b8082d754da5cc043631f))
* added image gallery on game detail pages ([8175ad5](https://github.com/uzh-bf/gbl-uzh/commit/8175ad533c356acf08b42b373043f06eb1a6e644))
* added ordering possibility with 'order: ' attribute for files in one of multiple folders ([069f093](https://github.com/uzh-bf/gbl-uzh/commit/069f093553fd8610dae4352115d6eba50243d722))
* added possibility to upload resources for game detail pages ([084cd69](https://github.com/uzh-bf/gbl-uzh/commit/084cd69c3b9243d042e0798bce7ebd273541e88e))
* added possiblity to obtain file slugs from specified file (additionally to the previous way; including ordering) ([52dcf87](https://github.com/uzh-bf/gbl-uzh/commit/52dcf876d7653a808e9f525bf326b959cb889ff8))
* added script which resizes all existing images (in the top image folder) and saves resized versions in separate folders during next build / next export ([eb91a6a](https://github.com/uzh-bf/gbl-uzh/commit/eb91a6a2efcb90e1f2a41516bdefbbe5a3758b46))
* game development page content is now directly pulled from the database ([529101d](https://github.com/uzh-bf/gbl-uzh/commit/529101d945ba235190e879fd2063abced5e204c7))
* images in subfolders are now resized as well ([eb00fe8](https://github.com/uzh-bf/gbl-uzh/commit/eb00fe8f75fda55df418c4d0c208296e18ebc8df))
* implement custom loader that passes through src ([a3fabac](https://github.com/uzh-bf/gbl-uzh/commit/a3fabac810d7a29d435c4bd8ca1b4036335783ae))
* moved games top-level page content to knowledge base ([84aa00f](https://github.com/uzh-bf/gbl-uzh/commit/84aa00fabbe0347c484a735525d12c37396c1908))
* work in progress tags can now be added with the attribute 'work in progress' ([30a81b9](https://github.com/uzh-bf/gbl-uzh/commit/30a81b9edd95739b0589986446b06983a901b354))


### Bug Fixes

* added key for successful deployment ([6e6aabc](https://github.com/uzh-bf/gbl-uzh/commit/6e6aabcdb168682b3e06e657109e31bf4b1079af))
* adjust link to u-fin ([f04265d](https://github.com/uzh-bf/gbl-uzh/commit/f04265d47e8e09ecc41a64bfa7f2a9312180c9aa))
* cursor pointer when hovering on menu icon ([d87b2ef](https://github.com/uzh-bf/gbl-uzh/commit/d87b2ef343fe4370d092256d380c52dd3eabc980))
* disable blur on games overview ([212fe5e](https://github.com/uzh-bf/gbl-uzh/commit/212fe5eb9c7c3512a12cd515a6f5d4060ea1ac60))
* ensure that package.json is in valid format ([77e3409](https://github.com/uzh-bf/gbl-uzh/commit/77e34094ec81469cae0010a8e51f96e85a2c94cc))
* entire nav-element area is now clickable ([b8244ef](https://github.com/uzh-bf/gbl-uzh/commit/b8244ef62c15560d16bb84f6b63175f7dc0459ee))
* fixed alignment of course titles on /games page on mobile devices ([7e36ee1](https://github.com/uzh-bf/gbl-uzh/commit/7e36ee1772c6b0f1a3b453227735e8af05afead2))
* fixed and refactored some file paths ([204c12e](https://github.com/uzh-bf/gbl-uzh/commit/204c12e0b8d782c16aff20b85b55578fa6abe858))
* fixed button layout on game detail pages ([f6e9e0f](https://github.com/uzh-bf/gbl-uzh/commit/f6e9e0f24d570bf81415c9b28847ef4d46f31a21))
* fixed button visibility on corresponding dev detail items ([6703c31](https://github.com/uzh-bf/gbl-uzh/commit/6703c31d6c8cb68e663a78b9a5f1122dc63b3b6b))
* fixed handling functions for nextImage and previousImage in gallery on game detail page ([7012a22](https://github.com/uzh-bf/gbl-uzh/commit/7012a22ae71ceeb6d27b7beb96d315ca86a6df32))
* fixed layout issue with tags on mobile devices ([6506461](https://github.com/uzh-bf/gbl-uzh/commit/6506461b29dab730d0fe3c988d109de8474fbee0))
* fixed layout issues on dev-page on mobile devices ([1690242](https://github.com/uzh-bf/gbl-uzh/commit/169024268e3c67b2238326bb840ce348a140ed80))
* fixed styling issues in connection with arrow buttons ([a5bb4f4](https://github.com/uzh-bf/gbl-uzh/commit/a5bb4f4f0e3bbecaae7436a4ef20848d9f043ecc))
* layout fix due to absolute positioning ([4ed6942](https://github.com/uzh-bf/gbl-uzh/commit/4ed69427a60acde7a93abffa70173a2bc45a57c8))
* layout fix for dev-page on mobile screens - previous/next button have the same width ([4b0027a](https://github.com/uzh-bf/gbl-uzh/commit/4b0027aa481b68ddd0dc4b04b0047d96f26d07ed))
* make content optional in HomeSection ([6f04c22](https://github.com/uzh-bf/gbl-uzh/commit/6f04c222d90ca6a9b3c9035bb3289124865e07dc))
* paths ([0e0b686](https://github.com/uzh-bf/gbl-uzh/commit/0e0b686946c41b81f773aaad27f3c3eb394bb205))
* restructure pages for working links ([9495ff9](https://github.com/uzh-bf/gbl-uzh/commit/9495ff9a6d831a28b25daa8a7dbac920eb70fc3d))
* updated outdated links and design issues ([845dbaf](https://github.com/uzh-bf/gbl-uzh/commit/845dbafcb77d0fc669f076b512ccdd23d2adc190))
* use next/link for HeroImage ([25b020d](https://github.com/uzh-bf/gbl-uzh/commit/25b020d15917d6e0e89692ab5c456f7d559aa1f8))


### Dependencies

* lockfile maintenance ([0723dc2](https://github.com/uzh-bf/gbl-uzh/commit/0723dc2278ccdce2d1c900b04f6cdacdb63a05ec))
* minor dep upgrades ([5ae1ebd](https://github.com/uzh-bf/gbl-uzh/commit/5ae1ebdd636c52f259111d0c2182993b98065a85))


### Refactors

* added some styling layouts to tailwind config; layout fixes ([6fe85ec](https://github.com/uzh-bf/gbl-uzh/commit/6fe85ecdc814bfbfdd93e38511f32419315ad5da))
* extract Panel component ([de2d475](https://github.com/uzh-bf/gbl-uzh/commit/de2d4752ffcf87dfbd4dbcf8ad1e586a8d1d677a))
* moved unnecessary code from tailwind config file to inline tailwind css commands ([9c47cdd](https://github.com/uzh-bf/gbl-uzh/commit/9c47cdd4af69c73d58df677caca7f647b32090d0))
* read game contents from kb files with correct title casing of names ([ecb7004](https://github.com/uzh-bf/gbl-uzh/commit/ecb7004761d2e19247c16a1050ecdf396d725504))
* reordered some code for enhancements later on ([4effe1d](https://github.com/uzh-bf/gbl-uzh/commit/4effe1df2d55bdb21a7f948d653b9b8511a644f2))


### Enhancements

* added cleanup function to avoid messing up the source repository ([ea500d8](https://github.com/uzh-bf/gbl-uzh/commit/ea500d8bf7a4fbc5e994a27fd88c259c447b3caf))
* added possibility to close the gallery zoom view with escape key ([bac8a5d](https://github.com/uzh-bf/gbl-uzh/commit/bac8a5d2a9f3498ab0e5606065cfcf3cde9ede66))
* data for the 'GBL in Use' page is now directly pulled from multiple single files for each game and course ([97816cd](https://github.com/uzh-bf/gbl-uzh/commit/97816cdb3d2292a01052e06fd86788a06aa626f0))
* enable leaving zoom by clicking outside any button or image area in the gallery (game detail pages) ([54fe1b1](https://github.com/uzh-bf/gbl-uzh/commit/54fe1b1a8c331bff4c0f99710afd4a41a0630320))
* hide footer on KB page ([a78a3ab](https://github.com/uzh-bf/gbl-uzh/commit/a78a3abb8924aa5182d1b116fed07d6d80dd0a74))
* improve content and styling and add new image assets on index page ([5d8cffc](https://github.com/uzh-bf/gbl-uzh/commit/5d8cffcaba0c5655d058a41018a85c1bd428faba))
* more general implementation for radarCharts ([b6d831f](https://github.com/uzh-bf/gbl-uzh/commit/b6d831f6e3b69c19ce8956b7be2b3da4371419b5))
* moved ordering to getStaticProps for more flexibility ([c53e2a9](https://github.com/uzh-bf/gbl-uzh/commit/c53e2a9953e467b40bceb73b025863fdb320eb28))
* parser for dev modules from separate files, corresponding getStaticProps-functions, etc. ([6737e90](https://github.com/uzh-bf/gbl-uzh/commit/6737e90a9ae49b07dd96757077007799846e35a8))
* remove unoptimized and use placeholder="blur" ([681b437](https://github.com/uzh-bf/gbl-uzh/commit/681b43708a8795f39771012796f0fe0b3e799dbe))


### Other

* adapted font hierarchy to standard header fonts ([78b45d7](https://github.com/uzh-bf/gbl-uzh/commit/78b45d73a9298700ef0039a50a890abd6f06317f))
* adapted loader to select smaller images, if they are sufficient for the current screen ([07dd791](https://github.com/uzh-bf/gbl-uzh/commit/07dd7915ea593edac4e645ad486e794bdef3e567))
* adapted style for mobile layout of games pages ([c7fec08](https://github.com/uzh-bf/gbl-uzh/commit/c7fec0865f5fe8c3dd15dc83161be4989cf581f5))
* add footer background and make logo images consistent ([cc5fde7](https://github.com/uzh-bf/gbl-uzh/commit/cc5fde76009e230cad9a0b4b1bcee2f088d0c11f))
* add htaccess to public folder ([7707fe8](https://github.com/uzh-bf/gbl-uzh/commit/7707fe8cac7b3b8f38faad0b94ab9e4690784187))
* add mention of future components ([7f1f8cc](https://github.com/uzh-bf/gbl-uzh/commit/7f1f8ccb6e1614cef8bfbc64bd7023d0da419bb1))
* add mention of the feedback page ([f255d01](https://github.com/uzh-bf/gbl-uzh/commit/f255d01042f908e42f6fdc012666bc4eaf2bd69a))
* add orange logo ([a55bc99](https://github.com/uzh-bf/gbl-uzh/commit/a55bc998a6084e4902b9894ad5960a3b29e3593e))
* add packageFiles and bumpFiles to standard-version config ([11576f2](https://github.com/uzh-bf/gbl-uzh/commit/11576f29c4d64c8c0665b3e0dcc919014ec7fbac))
* add release and optimize commands ([40ecedd](https://github.com/uzh-bf/gbl-uzh/commit/40ecedda3b380df0c14a09c4cd8044e37cbcdabd))
* added basic parsing possibility for radarchart data ([d4e3e06](https://github.com/uzh-bf/gbl-uzh/commit/d4e3e06336ecef0e8df4cae746519d60366af9b4))
* added images for portfolio management game detail page ([a156b40](https://github.com/uzh-bf/gbl-uzh/commit/a156b40b2e1f61abe28b703ec9bff2af7657e550))
* added two different button layouts for mobile devices ([ca31493](https://github.com/uzh-bf/gbl-uzh/commit/ca31493044fd2ccaa33c2dd06e44815e81dbd07b))
* added unoptimized property to images in order to remove next/image warning ([2d270f1](https://github.com/uzh-bf/gbl-uzh/commit/2d270f18bcbcbcd0e06ceeec55d6f189215fc232))
* centered nav button content on dev page modules ([86af276](https://github.com/uzh-bf/gbl-uzh/commit/86af27611f6f4c5ef25d67625ae1dc79b3f4fd61))
* change first letter of tags to capital case ([53a9735](https://github.com/uzh-bf/gbl-uzh/commit/53a97353800cce1043d7b804154179ed1ad9ff49))
* downgrade node to 14 ([e24acfe](https://github.com/uzh-bf/gbl-uzh/commit/e24acfe2eff605a25bd853f2bdcaca9e57faab2d))
* first implementation of cropped images in gallery on game detail pages (fine display on desktop and mobile devices; not ideal on screen sizes in between) ([828d48e](https://github.com/uzh-bf/gbl-uzh/commit/828d48ed4d845b32e47ed04b34d4535e4bd99965))
* fixed font size for H4 header on /about page ([aad2384](https://github.com/uzh-bf/gbl-uzh/commit/aad23841993f86d4c874c96a64f9c3f18342274b))
* fixed inefficient implementation detail ([f122662](https://github.com/uzh-bf/gbl-uzh/commit/f122662401bed3d35a5e40f7558c14b7f3547288))
* further repo restructuring and package-file cleanup ([06ca7a0](https://github.com/uzh-bf/gbl-uzh/commit/06ca7a036d5816893debb8eac94087b3afc8ebb3))
* further work on custom loader, but temporarily disabled ([ac207b9](https://github.com/uzh-bf/gbl-uzh/commit/ac207b9e751ea450ea160eff6e195ef8fda4680b))
* get title image on game detail pages from gallery (first image) ([0eb0e57](https://github.com/uzh-bf/gbl-uzh/commit/0eb0e5784d929e85e17711a60e62808882da8b34))
* image gallery on game detail page now looks fine on all screen sizes ([0298346](https://github.com/uzh-bf/gbl-uzh/commit/02983463ab85e128a97af8cbf194580e6e18eba2))
* improve layout of hero icons for index page ([e49a608](https://github.com/uzh-bf/gbl-uzh/commit/e49a608ffd54fed46fe297188bc2ccc153e0df31))
* improve layout of Title and TitleImage components ([06c72cf](https://github.com/uzh-bf/gbl-uzh/commit/06c72cf0cdc17fd480f4ca5b6a53424ccbe94e61))
* improved font hierarchy on /about page ([5363fa1](https://github.com/uzh-bf/gbl-uzh/commit/5363fa117c4847a8026c133695007a36376ab32e))
* kb markdown issues fixed; kb commit update; fixed typos ([1fd53b5](https://github.com/uzh-bf/gbl-uzh/commit/1fd53b5c12df922b4feddba51035f2d9c278dfd2))
* larger arrow buttons for the image gallery on game detail pages ([56b3d27](https://github.com/uzh-bf/gbl-uzh/commit/56b3d27291e0856ff6757dc3d1f3c2e21f2bb6ed))
* lockfile maintenance ([05b9646](https://github.com/uzh-bf/gbl-uzh/commit/05b9646e3f870f7846284f221e4f0039b7fde001))
* lockfile maintenance ([379faad](https://github.com/uzh-bf/gbl-uzh/commit/379faad20d03a93157627bd73c2c0f74baf43ad8))
* lockfile maintenance ([ad2900f](https://github.com/uzh-bf/gbl-uzh/commit/ad2900f5b405273d51f55578c56d8d5a85c722cc))
* max-width for title images and opacity change for banners without image ([ccee79e](https://github.com/uzh-bf/gbl-uzh/commit/ccee79e73754c0aab65c5dbaa8d6a063d0cdd4e1))
* minimal styling modification on /games page ([d21b4ef](https://github.com/uzh-bf/gbl-uzh/commit/d21b4ef5745099a336509f7c0ce92a435d1a2a5a))
* minor modifications for improved layout of dev-page on mobile devices ([78ec1f4](https://github.com/uzh-bf/gbl-uzh/commit/78ec1f4c31e52fd687c22a9adfb1679831309c61))
* move website contents to subdirectory and add kb submodule ([2fc8b5c](https://github.com/uzh-bf/gbl-uzh/commit/2fc8b5c3b8838212509407221b71534e62fded48))
* outsourced resizing functionalities into separate function (enables easier implementation of recursive crawling if necessary later on) ([395a8c8](https://github.com/uzh-bf/gbl-uzh/commit/395a8c8468a7d8ddadd0b0404c1df10210c7e4ba))
* reduce padding on mobile ([1a6754e](https://github.com/uzh-bf/gbl-uzh/commit/1a6754eb4c37f00fa3f383af3d4f1249558232eb))
* **release:** 0.0.18 ([3363987](https://github.com/uzh-bf/gbl-uzh/commit/3363987b89465d61ae01ec894c21bda1889d21c3))
* **release:** 0.0.19 ([0bdec1e](https://github.com/uzh-bf/gbl-uzh/commit/0bdec1e31a6afd94b9b421448fef94a03d26abe9))
* **release:** 0.0.20 ([ac75464](https://github.com/uzh-bf/gbl-uzh/commit/ac75464b360e88d42a253d9739093f6ddc723583))
* **release:** 0.1.0 ([6bcc712](https://github.com/uzh-bf/gbl-uzh/commit/6bcc71227542a12df0d12e4cccbddf4d67e8b398))
* **release:** 0.1.1 ([fff5db4](https://github.com/uzh-bf/gbl-uzh/commit/fff5db41c3e5f3ddea676ab73d144e413f2ea772))
* **release:** 0.2.0 ([3c5f5cf](https://github.com/uzh-bf/gbl-uzh/commit/3c5f5cfe8c15f543ffafe188bf3807c53e0e3020))
* remove old CHANGELOG ([5a341e5](https://github.com/uzh-bf/gbl-uzh/commit/5a341e586b7e983b08011f08f1ffa09d8c3ff96d))
* remove some leftover margin in the desktop navbar ([0073171](https://github.com/uzh-bf/gbl-uzh/commit/0073171f87386398410c394fa1bf479cde518ed0))
* removed unused step of copying images in original size ([7d1c5b4](https://github.com/uzh-bf/gbl-uzh/commit/7d1c5b4862a128f39824bab8b954c3eccbf06fce))
* replace image for citation on index page ([e4aed7d](https://github.com/uzh-bf/gbl-uzh/commit/e4aed7d85506953faf7a7350cb619a909d432011))
* restructure repository and add README and LICENSE ([32effa4](https://github.com/uzh-bf/gbl-uzh/commit/32effa404f0570abce31a2c34443ab1965872f13))
* small changes on TitleImage ([a58b5c5](https://github.com/uzh-bf/gbl-uzh/commit/a58b5c5e97e97841395bd193f8286b9fd445f22b))
* softened the appearance of the in progress tab on the game overview page ([9845253](https://github.com/uzh-bf/gbl-uzh/commit/984525374c2c3f46c80f1c897da2280470a7a262))
* styling of games pages; fixes of styling issues ([5390e1f](https://github.com/uzh-bf/gbl-uzh/commit/5390e1f32f8cf20cb306feadfb29da100b20c83a))
* submodule maintenance ([a6bb2a5](https://github.com/uzh-bf/gbl-uzh/commit/a6bb2a5714d64b0504711f92873a7e93109d6449))
* submodule maintenance ([ed59443](https://github.com/uzh-bf/gbl-uzh/commit/ed5944355190e17ff05030b001d53e27d831acd7))
* submodule maintenance ([3770fd3](https://github.com/uzh-bf/gbl-uzh/commit/3770fd3f6d0216b0972c0b5c9910dfe37bc29dc9))
* submodule maintenance ([900eb5c](https://github.com/uzh-bf/gbl-uzh/commit/900eb5cb5d529bad6eb783ffe3b1018a9d7dbcbf))
* submodule maintenance ([ab13f7f](https://github.com/uzh-bf/gbl-uzh/commit/ab13f7f5fd9c4ab329af18806fa141e9c8727cf8))
* submodule maintenance ([157bfb7](https://github.com/uzh-bf/gbl-uzh/commit/157bfb7e9eff51e3882a0bc96a7b83d7e8a3227d))
* submodule maintenance ([a9789ab](https://github.com/uzh-bf/gbl-uzh/commit/a9789ab7a3ca80eb627bf18d7c641e23f464211f))
* title images are now at least 80vw; titles without images restyled (especially on game detail pages) ([59a3386](https://github.com/uzh-bf/gbl-uzh/commit/59a3386df20697918f70771ec1895f07b849f7a4))
* update kb ([4883ef5](https://github.com/uzh-bf/gbl-uzh/commit/4883ef565395f7f4ff23c580ff76226957b4ae76))
* update loader procedure and adjust generated image sizes ([5015a79](https://github.com/uzh-bf/gbl-uzh/commit/5015a79dd917ed67655e2a5bc1669c6bb13b12e2))

### [0.0.15](https://github.com/uzh-bf/gbl-uzh/compare/v0.0.13...v0.0.15) (2021-05-01)


### Other

* **release:** 0.0.14 ([b16eb06](https://github.com/uzh-bf/gbl-uzh/commit/b16eb0622ed0920e005f7009d4e61fc747de6f99))
* **release:** 0.0.15 ([347db8f](https://github.com/uzh-bf/gbl-uzh/commit/347db8fef85d1827f89527aa6ac4040aaaf1f2a9))
