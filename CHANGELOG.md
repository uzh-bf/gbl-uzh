# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
