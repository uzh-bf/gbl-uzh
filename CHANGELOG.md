# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.13](https://github.com/uzh-bf/gbl-web/compare/v0.0.12...v0.0.13) (2021-04-26)


### Features

* add link to hypernotes to the KB page ([6fa5d18](https://github.com/uzh-bf/gbl-web/commit/6fa5d1846546ac34a75def14f58b8d82783c002e))
* initial page ideas for dbf ([e448321](https://github.com/uzh-bf/gbl-web/commit/e4483210166e9df75bef946e34be5040fd30194c))
* initial stub structure for the main page ([950136d](https://github.com/uzh-bf/gbl-web/commit/950136db9b3eda8e6232d3afc966a8f6f78505d4))

### [0.0.12](https://github.com/uzh-bf/gbl-web/compare/v0.0.11...v0.0.12) (2021-04-24)


### Features

* stubs for breadcrumbs and footer, dynamic navigation ([b4adbdb](https://github.com/uzh-bf/gbl-web/commit/b4adbdb8c9298a8780761ed214c8a3ba2ab24006))

### [0.0.11](https://github.com/uzh-bf/gbl-web/compare/v0.0.10...v0.0.11) (2021-04-24)


### Features

* generalize the page title ([ccbe26a](https://github.com/uzh-bf/gbl-web/commit/ccbe26a2d1bac7af3ca1357555b51f98ca585371))
* prepare pages for the overall site structure ([930911d](https://github.com/uzh-bf/gbl-web/commit/930911de8f7897344e777aac4bb09ac4341a9c86))
* working navigation ([6cfc762](https://github.com/uzh-bf/gbl-web/commit/6cfc762071d3d28ad2249d4520b470970b7b9e0e))

### [0.0.10](https://github.com/uzh-bf/gbl-web/compare/v0.0.9...v0.0.10) (2021-04-24)


### Features

* add footer ([4fe8791](https://github.com/uzh-bf/gbl-web/commit/4fe8791980b4eab4dce803eda9c8f9c44ca560ba))
* add initial links to navigation items ([a1157c2](https://github.com/uzh-bf/gbl-web/commit/a1157c2c8db66b6c76da1f8d4b697a141c9846cc))
* restrict the maximum width of the page ([cc0d42c](https://github.com/uzh-bf/gbl-web/commit/cc0d42cfc93b5de3afd486efd55632a201b53b06))
* structural rework and initial homepage structure ([0bf0f13](https://github.com/uzh-bf/gbl-web/commit/0bf0f136cac382e13b82d0f6e5316c6d3ecd4ec2))


### Bug Fixes

* the max-width should not apply to the footer ([d960a7b](https://github.com/uzh-bf/gbl-web/commit/d960a7b55ca4e6542d4c266ebef9ecfc33b05c24))
* update purge paths to src/ directory ([e95ede0](https://github.com/uzh-bf/gbl-web/commit/e95ede02e34249b54efdb427aa498fab4a874c12))

### [0.0.9](https://github.com/uzh-bf/gbl-web/compare/v0.0.8...v0.0.9) (2021-04-03)

### [0.0.8](https://github.com/uzh-bf/gbl-web/compare/v0.0.7...v0.0.8) (2021-04-03)


### Features

* setup tailwind and basic page for games ([85739f0](https://github.com/uzh-bf/gbl-web/commit/85739f026265ac6b4bb089157f09c0ea4bf378fd))

### [0.0.7](https://github.com/uzh-bf/gbl-web/compare/v0.0.6...v0.0.7) (2021-04-03)


### Features

* add content fields for game pages ([e6e7e1e](https://github.com/uzh-bf/gbl-web/commit/e6e7e1e8f320ebae76bdb8d457fae2aac4f9cfab))

### [0.0.6](https://github.com/uzh-bf/gbl-web/compare/v0.0.5...v0.0.6) (2021-04-03)


### Bug Fixes

* path resolution to Util ([032ae3a](https://github.com/uzh-bf/gbl-web/commit/032ae3ac3f0ca2b663782fdba0271e05838c4544))

### [0.0.5](https://github.com/uzh-bf/gbl-web/compare/v0.0.4...v0.0.5) (2021-04-03)


### Features

* add games collection, refactor: extract getStaticPaths and getStaticProps into Util ([e164d87](https://github.com/uzh-bf/gbl-web/commit/e164d87cbe9af4047252ea6c864448c8961e5575))

### [0.0.4](https://github.com/uzh-bf/gbl-web/compare/v0.0.3...v0.0.4) (2021-04-03)


### Bug Fixes

* ensure that empty directories are kept in git ([79be05a](https://github.com/uzh-bf/gbl-web/commit/79be05a51b5b47b22755a4c3bdeabe974c6b2894))

### [0.0.3](https://github.com/uzh-bf/gbl-web/compare/v0.0.2...v0.0.3) (2021-04-03)


### Bug Fixes

* path resolution in getStaticProps and getStaticPaths ([1a7acaf](https://github.com/uzh-bf/gbl-web/commit/1a7acaf129f8b744c6e1b081cb415d699d403ece))

### [0.0.2](https://github.com/uzh-bf/gbl-web/compare/v0.0.1...v0.0.2) (2021-04-03)


### Features

* setup standard-version ([d531cf6](https://github.com/uzh-bf/gbl-web/commit/d531cf64406f071deccd38f98c67b558bde1d68f))

### 0.0.1 (2021-04-03)


### Features

* dynamically create pages based on contents of the content/pages dir ([7cd1c09](https://github.com/uzh-bf/gbl-web/commit/7cd1c09f0fd6f70535be618759e59f1a3bbe4ddb))
* reinitialize with a custom next.js setup [#1](https://github.com/uzh-bf/gbl-web/issues/1) ([242ad5e](https://github.com/uzh-bf/gbl-web/commit/242ad5e2b88046dca9f024a3a89abab1562fa400))


### Bug Fixes

* use the out/ dir for netlify deployment ([f1d51e4](https://github.com/uzh-bf/gbl-web/commit/f1d51e44845c1209b62b9a6aee575c75cde93bca))
