# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/uzh-bf/gbl-web/compare/v0.1.0...v0.2.0) (2021-09-06)


### Features

* added arrows to switch between images in zoomed view ([e5b40a3](https://github.com/uzh-bf/gbl-web/commit/e5b40a30bccde92f68062e8302e66c292933822a))
* added gallery to game detail pages ([3923a82](https://github.com/uzh-bf/gbl-web/commit/3923a82d9f48a7d0360b8082d754da5cc043631f))
* added image gallery on game detail pages ([8175ad5](https://github.com/uzh-bf/gbl-web/commit/8175ad533c356acf08b42b373043f06eb1a6e644))
* added ordering possibility with 'order: ' attribute for files in one of multiple folders ([069f093](https://github.com/uzh-bf/gbl-web/commit/069f093553fd8610dae4352115d6eba50243d722))
* added possibility to upload resources for game detail pages ([084cd69](https://github.com/uzh-bf/gbl-web/commit/084cd69c3b9243d042e0798bce7ebd273541e88e))
* added possiblity to obtain file slugs from specified file (additionally to the previous way; including ordering) ([52dcf87](https://github.com/uzh-bf/gbl-web/commit/52dcf876d7653a808e9f525bf326b959cb889ff8))
* added script which resizes all existing images (in the top image folder) and saves resized versions in separate folders during next build / next export ([eb91a6a](https://github.com/uzh-bf/gbl-web/commit/eb91a6a2efcb90e1f2a41516bdefbbe5a3758b46))
* game development page content is now directly pulled from the database ([529101d](https://github.com/uzh-bf/gbl-web/commit/529101d945ba235190e879fd2063abced5e204c7))
* images in subfolders are now resized as well ([eb00fe8](https://github.com/uzh-bf/gbl-web/commit/eb00fe8f75fda55df418c4d0c208296e18ebc8df))
* implement custom loader that passes through src ([a3fabac](https://github.com/uzh-bf/gbl-web/commit/a3fabac810d7a29d435c4bd8ca1b4036335783ae))
* moved games top-level page content to knowledge base ([84aa00f](https://github.com/uzh-bf/gbl-web/commit/84aa00fabbe0347c484a735525d12c37396c1908))
* work in progress tags can now be added with the attribute 'work in progress' ([30a81b9](https://github.com/uzh-bf/gbl-web/commit/30a81b9edd95739b0589986446b06983a901b354))


### Bug Fixes

* added key for successful deployment ([6e6aabc](https://github.com/uzh-bf/gbl-web/commit/6e6aabcdb168682b3e06e657109e31bf4b1079af))
* adjust link to u-fin ([f04265d](https://github.com/uzh-bf/gbl-web/commit/f04265d47e8e09ecc41a64bfa7f2a9312180c9aa))
* cursor pointer when hovering on menu icon ([d87b2ef](https://github.com/uzh-bf/gbl-web/commit/d87b2ef343fe4370d092256d380c52dd3eabc980))
* entire nav-element area is now clickable ([b8244ef](https://github.com/uzh-bf/gbl-web/commit/b8244ef62c15560d16bb84f6b63175f7dc0459ee))
* fixed alignment of course titles on /games page on mobile devices ([7e36ee1](https://github.com/uzh-bf/gbl-web/commit/7e36ee1772c6b0f1a3b453227735e8af05afead2))
* fixed and refactored some file paths ([204c12e](https://github.com/uzh-bf/gbl-web/commit/204c12e0b8d782c16aff20b85b55578fa6abe858))
* fixed button layout on game detail pages ([f6e9e0f](https://github.com/uzh-bf/gbl-web/commit/f6e9e0f24d570bf81415c9b28847ef4d46f31a21))
* fixed button visibility on corresponding dev detail items ([6703c31](https://github.com/uzh-bf/gbl-web/commit/6703c31d6c8cb68e663a78b9a5f1122dc63b3b6b))
* fixed handling functions for nextImage and previousImage in gallery on game detail page ([7012a22](https://github.com/uzh-bf/gbl-web/commit/7012a22ae71ceeb6d27b7beb96d315ca86a6df32))
* fixed layout issue with tags on mobile devices ([6506461](https://github.com/uzh-bf/gbl-web/commit/6506461b29dab730d0fe3c988d109de8474fbee0))
* fixed layout issues on dev-page on mobile devices ([1690242](https://github.com/uzh-bf/gbl-web/commit/169024268e3c67b2238326bb840ce348a140ed80))
* fixed styling issues in connection with arrow buttons ([a5bb4f4](https://github.com/uzh-bf/gbl-web/commit/a5bb4f4f0e3bbecaae7436a4ef20848d9f043ecc))
* layout fix due to absolute positioning ([4ed6942](https://github.com/uzh-bf/gbl-web/commit/4ed69427a60acde7a93abffa70173a2bc45a57c8))
* layout fix for dev-page on mobile screens - previous/next button have the same width ([4b0027a](https://github.com/uzh-bf/gbl-web/commit/4b0027aa481b68ddd0dc4b04b0047d96f26d07ed))
* make content optional in HomeSection ([6f04c22](https://github.com/uzh-bf/gbl-web/commit/6f04c222d90ca6a9b3c9035bb3289124865e07dc))
* updated outdated links and design issues ([845dbaf](https://github.com/uzh-bf/gbl-web/commit/845dbafcb77d0fc669f076b512ccdd23d2adc190))


### Dependencies

* lockfile maintenance ([0723dc2](https://github.com/uzh-bf/gbl-web/commit/0723dc2278ccdce2d1c900b04f6cdacdb63a05ec))
* minor dep upgrades ([5ae1ebd](https://github.com/uzh-bf/gbl-web/commit/5ae1ebdd636c52f259111d0c2182993b98065a85))


### Refactors

* added some styling layouts to tailwind config; layout fixes ([6fe85ec](https://github.com/uzh-bf/gbl-web/commit/6fe85ecdc814bfbfdd93e38511f32419315ad5da))
* extract Panel component ([de2d475](https://github.com/uzh-bf/gbl-web/commit/de2d4752ffcf87dfbd4dbcf8ad1e586a8d1d677a))
* moved unnecessary code from tailwind config file to inline tailwind css commands ([9c47cdd](https://github.com/uzh-bf/gbl-web/commit/9c47cdd4af69c73d58df677caca7f647b32090d0))
* read game contents from kb files with correct title casing of names ([ecb7004](https://github.com/uzh-bf/gbl-web/commit/ecb7004761d2e19247c16a1050ecdf396d725504))
* reordered some code for enhancements later on ([4effe1d](https://github.com/uzh-bf/gbl-web/commit/4effe1df2d55bdb21a7f948d653b9b8511a644f2))


### Enhancements

* added cleanup function to avoid messing up the source repository ([ea500d8](https://github.com/uzh-bf/gbl-web/commit/ea500d8bf7a4fbc5e994a27fd88c259c447b3caf))
* added possibility to close the gallery zoom view with escape key ([bac8a5d](https://github.com/uzh-bf/gbl-web/commit/bac8a5d2a9f3498ab0e5606065cfcf3cde9ede66))
* data for the 'GBL in Use' page is now directly pulled from multiple single files for each game and course ([97816cd](https://github.com/uzh-bf/gbl-web/commit/97816cdb3d2292a01052e06fd86788a06aa626f0))
* enable leaving zoom by clicking outside any button or image area in the gallery (game detail pages) ([54fe1b1](https://github.com/uzh-bf/gbl-web/commit/54fe1b1a8c331bff4c0f99710afd4a41a0630320))
* hide footer on KB page ([a78a3ab](https://github.com/uzh-bf/gbl-web/commit/a78a3abb8924aa5182d1b116fed07d6d80dd0a74))
* improve content and styling and add new image assets on index page ([5d8cffc](https://github.com/uzh-bf/gbl-web/commit/5d8cffcaba0c5655d058a41018a85c1bd428faba))
* more general implementation for radarCharts ([b6d831f](https://github.com/uzh-bf/gbl-web/commit/b6d831f6e3b69c19ce8956b7be2b3da4371419b5))
* moved ordering to getStaticProps for more flexibility ([c53e2a9](https://github.com/uzh-bf/gbl-web/commit/c53e2a9953e467b40bceb73b025863fdb320eb28))
* parser for dev modules from separate files, corresponding getStaticProps-functions, etc. ([6737e90](https://github.com/uzh-bf/gbl-web/commit/6737e90a9ae49b07dd96757077007799846e35a8))
* remove unoptimized and use placeholder="blur" ([681b437](https://github.com/uzh-bf/gbl-web/commit/681b43708a8795f39771012796f0fe0b3e799dbe))


### Other

* adapted font hierarchy to standard header fonts ([78b45d7](https://github.com/uzh-bf/gbl-web/commit/78b45d73a9298700ef0039a50a890abd6f06317f))
* adapted loader to select smaller images, if they are sufficient for the current screen ([07dd791](https://github.com/uzh-bf/gbl-web/commit/07dd7915ea593edac4e645ad486e794bdef3e567))
* adapted style for mobile layout of games pages ([c7fec08](https://github.com/uzh-bf/gbl-web/commit/c7fec0865f5fe8c3dd15dc83161be4989cf581f5))
* add footer background and make logo images consistent ([cc5fde7](https://github.com/uzh-bf/gbl-web/commit/cc5fde76009e230cad9a0b4b1bcee2f088d0c11f))
* add release and optimize commands ([40ecedd](https://github.com/uzh-bf/gbl-web/commit/40ecedda3b380df0c14a09c4cd8044e37cbcdabd))
* added basic parsing possibility for radarchart data ([d4e3e06](https://github.com/uzh-bf/gbl-web/commit/d4e3e06336ecef0e8df4cae746519d60366af9b4))
* added images for portfolio management game detail page ([a156b40](https://github.com/uzh-bf/gbl-web/commit/a156b40b2e1f61abe28b703ec9bff2af7657e550))
* added two different button layouts for mobile devices ([ca31493](https://github.com/uzh-bf/gbl-web/commit/ca31493044fd2ccaa33c2dd06e44815e81dbd07b))
* added unoptimized property to images in order to remove next/image warning ([2d270f1](https://github.com/uzh-bf/gbl-web/commit/2d270f18bcbcbcd0e06ceeec55d6f189215fc232))
* centered nav button content on dev page modules ([86af276](https://github.com/uzh-bf/gbl-web/commit/86af27611f6f4c5ef25d67625ae1dc79b3f4fd61))
* change first letter of tags to capital case ([53a9735](https://github.com/uzh-bf/gbl-web/commit/53a97353800cce1043d7b804154179ed1ad9ff49))
* downgrade node to 14 ([e24acfe](https://github.com/uzh-bf/gbl-web/commit/e24acfe2eff605a25bd853f2bdcaca9e57faab2d))
* first implementation of cropped images in gallery on game detail pages (fine display on desktop and mobile devices; not ideal on screen sizes in between) ([828d48e](https://github.com/uzh-bf/gbl-web/commit/828d48ed4d845b32e47ed04b34d4535e4bd99965))
* fixed font size for H4 header on /about page ([aad2384](https://github.com/uzh-bf/gbl-web/commit/aad23841993f86d4c874c96a64f9c3f18342274b))
* fixed inefficient implementation detail ([f122662](https://github.com/uzh-bf/gbl-web/commit/f122662401bed3d35a5e40f7558c14b7f3547288))
* further work on custom loader, but temporarily disabled ([ac207b9](https://github.com/uzh-bf/gbl-web/commit/ac207b9e751ea450ea160eff6e195ef8fda4680b))
* get title image on game detail pages from gallery (first image) ([0eb0e57](https://github.com/uzh-bf/gbl-web/commit/0eb0e5784d929e85e17711a60e62808882da8b34))
* image gallery on game detail page now looks fine on all screen sizes ([0298346](https://github.com/uzh-bf/gbl-web/commit/02983463ab85e128a97af8cbf194580e6e18eba2))
* improve layout of hero icons for index page ([e49a608](https://github.com/uzh-bf/gbl-web/commit/e49a608ffd54fed46fe297188bc2ccc153e0df31))
* improve layout of Title and TitleImage components ([06c72cf](https://github.com/uzh-bf/gbl-web/commit/06c72cf0cdc17fd480f4ca5b6a53424ccbe94e61))
* improved font hierarchy on /about page ([5363fa1](https://github.com/uzh-bf/gbl-web/commit/5363fa117c4847a8026c133695007a36376ab32e))
* kb markdown issues fixed; kb commit update; fixed typos ([1fd53b5](https://github.com/uzh-bf/gbl-web/commit/1fd53b5c12df922b4feddba51035f2d9c278dfd2))
* larger arrow buttons for the image gallery on game detail pages ([56b3d27](https://github.com/uzh-bf/gbl-web/commit/56b3d27291e0856ff6757dc3d1f3c2e21f2bb6ed))
* lockfile maintenance ([379faad](https://github.com/uzh-bf/gbl-web/commit/379faad20d03a93157627bd73c2c0f74baf43ad8))
* lockfile maintenance ([ad2900f](https://github.com/uzh-bf/gbl-web/commit/ad2900f5b405273d51f55578c56d8d5a85c722cc))
* max-width for title images and opacity change for banners without image ([ccee79e](https://github.com/uzh-bf/gbl-web/commit/ccee79e73754c0aab65c5dbaa8d6a063d0cdd4e1))
* minimal styling modification on /games page ([d21b4ef](https://github.com/uzh-bf/gbl-web/commit/d21b4ef5745099a336509f7c0ce92a435d1a2a5a))
* minor modifications for improved layout of dev-page on mobile devices ([78ec1f4](https://github.com/uzh-bf/gbl-web/commit/78ec1f4c31e52fd687c22a9adfb1679831309c61))
* move website contents to subdirectory and add kb submodule ([2fc8b5c](https://github.com/uzh-bf/gbl-web/commit/2fc8b5c3b8838212509407221b71534e62fded48))
* outsourced resizing functionalities into separate function (enables easier implementation of recursive crawling if necessary later on) ([395a8c8](https://github.com/uzh-bf/gbl-web/commit/395a8c8468a7d8ddadd0b0404c1df10210c7e4ba))
* reduce padding on mobile ([1a6754e](https://github.com/uzh-bf/gbl-web/commit/1a6754eb4c37f00fa3f383af3d4f1249558232eb))
* **release:** 0.0.18 ([3363987](https://github.com/uzh-bf/gbl-web/commit/3363987b89465d61ae01ec894c21bda1889d21c3))
* **release:** 0.0.19 ([0bdec1e](https://github.com/uzh-bf/gbl-web/commit/0bdec1e31a6afd94b9b421448fef94a03d26abe9))
* **release:** 0.0.20 ([ac75464](https://github.com/uzh-bf/gbl-web/commit/ac75464b360e88d42a253d9739093f6ddc723583))
* **release:** 0.1.0 ([6bcc712](https://github.com/uzh-bf/gbl-web/commit/6bcc71227542a12df0d12e4cccbddf4d67e8b398))
* **release:** 0.1.1 ([fff5db4](https://github.com/uzh-bf/gbl-web/commit/fff5db41c3e5f3ddea676ab73d144e413f2ea772))
* remove some leftover margin in the desktop navbar ([0073171](https://github.com/uzh-bf/gbl-web/commit/0073171f87386398410c394fa1bf479cde518ed0))
* removed unused step of copying images in original size ([7d1c5b4](https://github.com/uzh-bf/gbl-web/commit/7d1c5b4862a128f39824bab8b954c3eccbf06fce))
* replace image for citation on index page ([e4aed7d](https://github.com/uzh-bf/gbl-web/commit/e4aed7d85506953faf7a7350cb619a909d432011))
* small changes on TitleImage ([a58b5c5](https://github.com/uzh-bf/gbl-web/commit/a58b5c5e97e97841395bd193f8286b9fd445f22b))
* softened the appearance of the in progress tab on the game overview page ([9845253](https://github.com/uzh-bf/gbl-web/commit/984525374c2c3f46c80f1c897da2280470a7a262))
* styling of games pages; fixes of styling issues ([5390e1f](https://github.com/uzh-bf/gbl-web/commit/5390e1f32f8cf20cb306feadfb29da100b20c83a))
* submodule maintenance ([a6bb2a5](https://github.com/uzh-bf/gbl-web/commit/a6bb2a5714d64b0504711f92873a7e93109d6449))
* submodule maintenance ([ed59443](https://github.com/uzh-bf/gbl-web/commit/ed5944355190e17ff05030b001d53e27d831acd7))
* submodule maintenance ([3770fd3](https://github.com/uzh-bf/gbl-web/commit/3770fd3f6d0216b0972c0b5c9910dfe37bc29dc9))
* submodule maintenance ([900eb5c](https://github.com/uzh-bf/gbl-web/commit/900eb5cb5d529bad6eb783ffe3b1018a9d7dbcbf))
* submodule maintenance ([ab13f7f](https://github.com/uzh-bf/gbl-web/commit/ab13f7f5fd9c4ab329af18806fa141e9c8727cf8))
* submodule maintenance ([157bfb7](https://github.com/uzh-bf/gbl-web/commit/157bfb7e9eff51e3882a0bc96a7b83d7e8a3227d))
* submodule maintenance ([a9789ab](https://github.com/uzh-bf/gbl-web/commit/a9789ab7a3ca80eb627bf18d7c641e23f464211f))
* title images are now at least 80vw; titles without images restyled (especially on game detail pages) ([59a3386](https://github.com/uzh-bf/gbl-web/commit/59a3386df20697918f70771ec1895f07b849f7a4))
* update loader procedure and adjust generated image sizes ([5015a79](https://github.com/uzh-bf/gbl-web/commit/5015a79dd917ed67655e2a5bc1669c6bb13b12e2))

### [0.0.15](https://github.com/uzh-bf/gbl-web/compare/v0.0.13...v0.0.15) (2021-05-01)


### Other

* **release:** 0.0.14 ([b16eb06](https://github.com/uzh-bf/gbl-web/commit/b16eb0622ed0920e005f7009d4e61fc747de6f99))
* **release:** 0.0.15 ([347db8f](https://github.com/uzh-bf/gbl-web/commit/347db8fef85d1827f89527aa6ac4040aaaf1f2a9))

### [0.1.1](https://github.com/uzh-bf/gbl-web/compare/v0.0.20...v0.1.1) (2021-06-16)


### Features

* add contents for game details and update layout ([65d154b](https://github.com/uzh-bf/gbl-web/commit/65d154b9265c809a70ab172f1763588afe685521))
* add icons to roadmap page ([ffb20a9](https://github.com/uzh-bf/gbl-web/commit/ffb20a967bb168d81505968b069098c210e1f72a))
* contents for the dev page ([8618a91](https://github.com/uzh-bf/gbl-web/commit/8618a9182fb39f2ce807d274032db01685f13fa9))
* draft contents of the roadmap page ([234921d](https://github.com/uzh-bf/gbl-web/commit/234921db5f90d6d309cf09ba6312b2b47fe0e8e5))
* easy image optimizations ([9da65ee](https://github.com/uzh-bf/gbl-web/commit/9da65ee7927a928b509d4608e4b055de53a1504d))
* full layout rework ([#6](https://github.com/uzh-bf/gbl-web/issues/6)) ([f3df95a](https://github.com/uzh-bf/gbl-web/commit/f3df95a372c17896655d4152b3e272291e513c6f))
* small text for principles of GBL ([1cdf34a](https://github.com/uzh-bf/gbl-web/commit/1cdf34ab459bb9b0c5f7b3dacd8b29ed43ade69e))


### Bug Fixes

* ensure logo is not warped with next/image, fix: add links to the games on the index page ([29112f5](https://github.com/uzh-bf/gbl-web/commit/29112f5454c354d642d8af3f03f7f141b1ec524b))
* game links to detail pages ([a8bce26](https://github.com/uzh-bf/gbl-web/commit/a8bce2608fd07760f9140760a3cb1898f3df8b72))
* missing space in pb game description ([41b5cb2](https://github.com/uzh-bf/gbl-web/commit/41b5cb24a0d097ec4c2c25752a5abc3195ba0627))
* type issues in build ([c4ecb3a](https://github.com/uzh-bf/gbl-web/commit/c4ecb3a1e9b2b9c1512af880dba33e69f20ab9dd))


* **release:** 0.1.0 ([6bcc712](https://github.com/uzh-bf/gbl-web/commit/6bcc71227542a12df0d12e4cccbddf4d67e8b398))

## [0.1.0](https://github.com/uzh-bf/gbl-web/compare/v0.0.20...v0.1.0) (2021-06-16)

### Features

- add contents for game details and update layout ([65d154b](https://github.com/uzh-bf/gbl-web/commit/65d154b9265c809a70ab172f1763588afe685521))
- add icons to roadmap page ([ffb20a9](https://github.com/uzh-bf/gbl-web/commit/ffb20a967bb168d81505968b069098c210e1f72a))
- contents for the dev page ([8618a91](https://github.com/uzh-bf/gbl-web/commit/8618a9182fb39f2ce807d274032db01685f13fa9))
- draft contents of the roadmap page ([234921d](https://github.com/uzh-bf/gbl-web/commit/234921db5f90d6d309cf09ba6312b2b47fe0e8e5))
- easy image optimizations ([9da65ee](https://github.com/uzh-bf/gbl-web/commit/9da65ee7927a928b509d4608e4b055de53a1504d))
- full layout rework ([#6](https://github.com/uzh-bf/gbl-web/issues/6)) ([f3df95a](https://github.com/uzh-bf/gbl-web/commit/f3df95a372c17896655d4152b3e272291e513c6f))
- small text for principles of GBL ([1cdf34a](https://github.com/uzh-bf/gbl-web/commit/1cdf34ab459bb9b0c5f7b3dacd8b29ed43ade69e))

### Bug Fixes

- game links to detail pages ([a8bce26](https://github.com/uzh-bf/gbl-web/commit/a8bce2608fd07760f9140760a3cb1898f3df8b72))
- missing space in pb game description ([41b5cb2](https://github.com/uzh-bf/gbl-web/commit/41b5cb24a0d097ec4c2c25752a5abc3195ba0627))
- type issues in build ([c4ecb3a](https://github.com/uzh-bf/gbl-web/commit/c4ecb3a1e9b2b9c1512af880dba33e69f20ab9dd))

### [0.0.20](https://github.com/uzh-bf/gbl-web/compare/v0.0.19...v0.0.20) (2021-06-11)

### Bug Fixes

- use github provider with config settings ([82f380b](https://github.com/uzh-bf/gbl-web/commit/82f380b15c9b5738de5c3d8a1ad0ec30147d1690))

### [0.0.19](https://github.com/uzh-bf/gbl-web/compare/v0.0.18...v0.0.19) (2021-06-11)

### Bug Fixes

- type issues ([0759a31](https://github.com/uzh-bf/gbl-web/commit/0759a3186c3405441a6fc5e52f33ab9908c38094))

### [0.0.18](https://github.com/uzh-bf/gbl-web/compare/v0.0.17...v0.0.18) (2021-06-11)

### Features

- add font-kollektif-bold ([aa17171](https://github.com/uzh-bf/gbl-web/commit/aa171715cfa3e7cac8143e78dab78eb8bbee7d6e))
- setup oauth with github and local repo mode for netlify ([d93b538](https://github.com/uzh-bf/gbl-web/commit/d93b5381dbff02fa394af3b74b889cca4ef93ec6))
- update text contents of the start page ([14ec920](https://github.com/uzh-bf/gbl-web/commit/14ec9206fcf11b63cf254a7a01ccac8f66b65049))

### Bug Fixes

- broken base path ([8db0a94](https://github.com/uzh-bf/gbl-web/commit/8db0a949eeec8497e7c8a4df312be5bab145964f))
- ensure that navigation items are also highlighted on subpages ([997cc94](https://github.com/uzh-bf/gbl-web/commit/997cc94ef8bdb7515fab9ebbfce0ba7648f83f3d))
- ensure that the hero image does not scale infinitely ([1a2703b](https://github.com/uzh-bf/gbl-web/commit/1a2703b0e98dbe43fc20af3df18c50c2d71e93b5))
- images in footer ([b440060](https://github.com/uzh-bf/gbl-web/commit/b4400604f584d0ec337d39077ac324838b8cc00a))
- make game cards clickable ([d7ae326](https://github.com/uzh-bf/gbl-web/commit/d7ae326a15753289647acb29e09b8fc1c22bb752))
- make icon content description the same text size as the other intro text ([dd78f3d](https://github.com/uzh-bf/gbl-web/commit/dd78f3d1a2c7fdc820ee8e1a66c331abe7952da8))

### Dependencies

- upgrade next-mdx-remote ([243b5a4](https://github.com/uzh-bf/gbl-web/commit/243b5a4185c0469b1a14e8ef6740c493ad716647))
- upgrade packages ([988e230](https://github.com/uzh-bf/gbl-web/commit/988e230fc62a70b273ff8b6fc0cb5b5392bcbf87))

- add deps to standard-version ([acaaf6f](https://github.com/uzh-bf/gbl-web/commit/acaaf6f920912e2d39ae209c73895f3f2f230a77))
- use kollektif font for all headers ([89940ef](https://github.com/uzh-bf/gbl-web/commit/89940efab918cdc7e7f1017618570f7e9997cedb))

### [0.0.15](https://github.com/uzh-bf/gbl-web/compare/v0.0.13...v0.0.15) (2021-05-01)

- **release:** 0.0.14 ([b16eb06](https://github.com/uzh-bf/gbl-web/commit/b16eb0622ed0920e005f7009d4e61fc747de6f99))
- **release:** 0.0.15 ([347db8f](https://github.com/uzh-bf/gbl-web/commit/347db8fef85d1827f89527aa6ac4040aaaf1f2a9))

### [0.0.17](https://github.com/uzh-bf/gbl-web/compare/v0.0.16...v0.0.17) (2021-05-03)

### Features

- add about us page and gbl video thumb ([b6edc13](https://github.com/uzh-bf/gbl-web/commit/b6edc13d59f92ded137ac621a0f101b2b5354573))
- draft an initial roadmap structure ([52f10b4](https://github.com/uzh-bf/gbl-web/commit/52f10b4eeb23737b66c1c67f0e1dd203fdf64f2c))
- draft initial game dev pages ([4cca8f3](https://github.com/uzh-bf/gbl-web/commit/4cca8f3505bc695952486fc027aade061c6a790d))

### Bug Fixes

- add type declaration for easy forms ([07577cc](https://github.com/uzh-bf/gbl-web/commit/07577cc846cb096e06c8c852ca57cdb22ea51af3))
- ensure that the type for isHoverable is a boolean ([e694698](https://github.com/uzh-bf/gbl-web/commit/e694698862dce8a2cc44f714af2ec4885821945e))

- bump version ([f60affe](https://github.com/uzh-bf/gbl-web/commit/f60affe7cda7a6ef0c6732aad154d26aebfe5fd1))
- remove dev workflow from navigation ([4170ad4](https://github.com/uzh-bf/gbl-web/commit/4170ad43ea80b9383d6a798052b414c14a62a40c))
- set the base path for deployment ([abee119](https://github.com/uzh-bf/gbl-web/commit/abee11906228d086f6f7eeda576924c8e925f812))

### [0.0.16](https://github.com/uzh-bf/gbl-web/compare/v0.0.13...v0.0.16) (2021-05-03)

### Features

- add banner sections and updated home section contents ([6b6b1b3](https://github.com/uzh-bf/gbl-web/commit/6b6b1b3b86583abc8e33c4848e1a22ff20f4dad0))
- add contact forms for about us and roadmap ([3075de2](https://github.com/uzh-bf/gbl-web/commit/3075de25db20f4d1ca9d88718ba2f428e5daaa1a))
- add mock contents for remaining games ([06cb13e](https://github.com/uzh-bf/gbl-web/commit/06cb13e8f5395ac9c52505fb49ee6503eb2d43b5))
- add pfm image with grayscale filter and uzh blues ([9ca878c](https://github.com/uzh-bf/gbl-web/commit/9ca878c865e01e697e868c55ec1c14713224756f))
- add stub page for a single game ([56332e7](https://github.com/uzh-bf/gbl-web/commit/56332e7c341bad75a9ec9569f54811e9d9c4912f))
- add uzh and swissuni logo to footer ([e1de69b](https://github.com/uzh-bf/gbl-web/commit/e1de69bb724e4508c689baca8657ad334dedd71b))
- base content structure for about and resources ([c69f726](https://github.com/uzh-bf/gbl-web/commit/c69f7260ca9c2302c75dfbfb91630fbda7e84951))
- basic structure for a page on workflow step ([d0433b2](https://github.com/uzh-bf/gbl-web/commit/d0433b2e04a67fedc5707df3d575fe6872ca73d9))
- basic structure for resources ([7cc5ab7](https://github.com/uzh-bf/gbl-web/commit/7cc5ab7e8c32bd76f5b0b53753e88af4433e1a86))
- component structure and layout for dbf overview page and generic headers ([f5e8fb0](https://github.com/uzh-bf/gbl-web/commit/f5e8fb0b44772afb8fcb6f407c7adc2709fabee0))
- create banner section component ([a3fc006](https://github.com/uzh-bf/gbl-web/commit/a3fc00650a48910e0df9fd826587a8897ad1fbfc))
- embed the knowledge base ([ae434a0](https://github.com/uzh-bf/gbl-web/commit/ae434a049a01515bb057193821a56845219b09e6))
- extend home section with icon content subcomponent ([6b48eda](https://github.com/uzh-bf/gbl-web/commit/6b48edac786a3312d7a2caf4053591e38ce8aab1))
- hover the navigation in uzh blue ([d106baf](https://github.com/uzh-bf/gbl-web/commit/d106baf788fbad06d2629f08bf91d233fee6fa3d))
- improve footer styling on mobile ([d1ddb0a](https://github.com/uzh-bf/gbl-web/commit/d1ddb0add9abd5c0cc54c98d505435310c22ddd2))
- improve header styling on mobile ([ee8e697](https://github.com/uzh-bf/gbl-web/commit/ee8e6972ab16d789d79b07d758e8d0163935afca))
- improve responsiveness of hero images and replace with SVG ([92aca62](https://github.com/uzh-bf/gbl-web/commit/92aca62c1a32f9ab26de3feb68a8dff20349b8f0))
- improve styling of hero image on index ([80f0bad](https://github.com/uzh-bf/gbl-web/commit/80f0bad1821d1b65b6614ac8298a88fc243c2c85))
- index page with heros and layouting changes ([8f55af0](https://github.com/uzh-bf/gbl-web/commit/8f55af015804abc9bac471402e43690eba997319))
- link hero images to pages ([41c3302](https://github.com/uzh-bf/gbl-web/commit/41c33021c3bbe4ef2e84f1d5f9291c9dc59d6764))
- redesign banner sections ([eb05483](https://github.com/uzh-bf/gbl-web/commit/eb05483287f61e1d21c95966d922a7ce5b5cd922))
- replace div icons with SVG and add icon layout for roadmap section ([ef0a932](https://github.com/uzh-bf/gbl-web/commit/ef0a9327908c3fcd8d33419fefa0535ffb62e4f3))
- slight rework of game detail page with tags ([3812c90](https://github.com/uzh-bf/gbl-web/commit/3812c9032583bdab5f41c1a91d3f14962a0ca591))
- update stakeholder icons to look clickable ([c39ffab](https://github.com/uzh-bf/gbl-web/commit/c39ffab17ebc5a0029537a5bfa78d04c9370366a))
- use uzh blue and bold font for buttons ([220bc2d](https://github.com/uzh-bf/gbl-web/commit/220bc2dfdb7009862e3b9560fef66ab1e6820966))
- use uzh blue for headers ([a66ea42](https://github.com/uzh-bf/gbl-web/commit/a66ea42a4316bdef20b987137743c78afb68af08))

### Bug Fixes

- add max width for dbf overview ([24446e0](https://github.com/uzh-bf/gbl-web/commit/24446e0c08a2bd940cab02f23ec27d81beb97766))
- ensure that the footer is overlayed on top of the page ([607a802](https://github.com/uzh-bf/gbl-web/commit/607a8020cc00500a6faa66b35beebeb08271f38b))
- hide overflow in the page body to ensure footer is shown ([282758e](https://github.com/uzh-bf/gbl-web/commit/282758e38f3aa8921afcc3a6fffab45c708e85a3))
- improve responsiveness of leading quote ([ca26bc7](https://github.com/uzh-bf/gbl-web/commit/ca26bc73a63f55e2c3ade3146c1d7227e61e295c))
- improvements to index consistency ([6bd2b95](https://github.com/uzh-bf/gbl-web/commit/6bd2b958a77c7db45b3449481125a52938c7b80e))
- reduce distance of quote border ([bd2e185](https://github.com/uzh-bf/gbl-web/commit/bd2e18537dbcf9971f7b49773abb1b1fb1bd04cf))
- revert back to footer z-indes and bg approach ([89e0a4a](https://github.com/uzh-bf/gbl-web/commit/89e0a4ad3ae6b71383a05df3c7aa5eff9cef30a4))

### Refactors

- extract useful components from index page ([3672ed8](https://github.com/uzh-bf/gbl-web/commit/3672ed89af7b5133c7a961a28ecf8c8fac4845cb))
- move section components to subdirectory ([eb91dc9](https://github.com/uzh-bf/gbl-web/commit/eb91dc903b661d0135b42682b26dc07596eb7885))

- **release:** 0.0.14 ([abbc434](https://github.com/uzh-bf/gbl-web/commit/abbc434498c80e79543eb0312e5bfa7afaec1474))
- add example rext for roadmap ([585d13a](https://github.com/uzh-bf/gbl-web/commit/585d13a0a654665285d88f9d1203f1f31e178339))
- add more types for semantic-version ([522637e](https://github.com/uzh-bf/gbl-web/commit/522637ea4031839bd52ef390fe9c50ecbd6ec2ab))
- add tailwind plugins ([212e739](https://github.com/uzh-bf/gbl-web/commit/212e7398c1947f9d5680fde177bc8b94ba428b58))
- add tailwind plugins to config ([a0d6286](https://github.com/uzh-bf/gbl-web/commit/a0d62868594f6eddd9d05889ec3595a425fb30fe))
- add ufin and link to the detail page ([6ec8272](https://github.com/uzh-bf/gbl-web/commit/6ec8272073928a09ca718e6e5162ed04b8dafc96))
- add uzh red for bg ([cfa7f24](https://github.com/uzh-bf/gbl-web/commit/cfa7f2404e53a65ef65fd50aa18c44b5c595f678))
- lockfile maintenance ([b6728a5](https://github.com/uzh-bf/gbl-web/commit/b6728a553fb9267098320100b469d0b28347b505))
- lockfile maintenance ([740d379](https://github.com/uzh-bf/gbl-web/commit/740d379e36ad65e0261dfb4110aceb8fae36b62d))
- padding on index ([7d0f942](https://github.com/uzh-bf/gbl-web/commit/7d0f94205339829c136a88b188f2d3c0b2d36c13))
- refactoring components ([6bac53c](https://github.com/uzh-bf/gbl-web/commit/6bac53c7c1faed135baac5016a266f8437784772))
- update dev workflow image with removed headers ([2ce0c8d](https://github.com/uzh-bf/gbl-web/commit/2ce0c8d579624f74e828a9d142e47e8089ce421a))

### [0.0.14](https://github.com/uzh-bf/gbl-web/compare/v0.0.13...v0.0.14) (2021-05-03)

### Features

- add banner sections and updated home section contents ([6b6b1b3](https://github.com/uzh-bf/gbl-web/commit/6b6b1b3b86583abc8e33c4848e1a22ff20f4dad0))
- add contact forms for about us and roadmap ([3075de2](https://github.com/uzh-bf/gbl-web/commit/3075de25db20f4d1ca9d88718ba2f428e5daaa1a))
- add mock contents for remaining games ([06cb13e](https://github.com/uzh-bf/gbl-web/commit/06cb13e8f5395ac9c52505fb49ee6503eb2d43b5))
- add pfm image with grayscale filter and uzh blues ([9ca878c](https://github.com/uzh-bf/gbl-web/commit/9ca878c865e01e697e868c55ec1c14713224756f))
- add stub page for a single game ([56332e7](https://github.com/uzh-bf/gbl-web/commit/56332e7c341bad75a9ec9569f54811e9d9c4912f))
- add uzh and swissuni logo to footer ([e1de69b](https://github.com/uzh-bf/gbl-web/commit/e1de69bb724e4508c689baca8657ad334dedd71b))
- base content structure for about and resources ([c69f726](https://github.com/uzh-bf/gbl-web/commit/c69f7260ca9c2302c75dfbfb91630fbda7e84951))
- basic structure for a page on workflow step ([d0433b2](https://github.com/uzh-bf/gbl-web/commit/d0433b2e04a67fedc5707df3d575fe6872ca73d9))
- basic structure for resources ([7cc5ab7](https://github.com/uzh-bf/gbl-web/commit/7cc5ab7e8c32bd76f5b0b53753e88af4433e1a86))
- component structure and layout for dbf overview page and generic headers ([f5e8fb0](https://github.com/uzh-bf/gbl-web/commit/f5e8fb0b44772afb8fcb6f407c7adc2709fabee0))
- create banner section component ([a3fc006](https://github.com/uzh-bf/gbl-web/commit/a3fc00650a48910e0df9fd826587a8897ad1fbfc))
- embed the knowledge base ([ae434a0](https://github.com/uzh-bf/gbl-web/commit/ae434a049a01515bb057193821a56845219b09e6))
- extend home section with icon content subcomponent ([6b48eda](https://github.com/uzh-bf/gbl-web/commit/6b48edac786a3312d7a2caf4053591e38ce8aab1))
- hover the navigation in uzh blue ([d106baf](https://github.com/uzh-bf/gbl-web/commit/d106baf788fbad06d2629f08bf91d233fee6fa3d))
- improve footer styling on mobile ([d1ddb0a](https://github.com/uzh-bf/gbl-web/commit/d1ddb0add9abd5c0cc54c98d505435310c22ddd2))
- improve header styling on mobile ([ee8e697](https://github.com/uzh-bf/gbl-web/commit/ee8e6972ab16d789d79b07d758e8d0163935afca))
- improve responsiveness of hero images and replace with SVG ([92aca62](https://github.com/uzh-bf/gbl-web/commit/92aca62c1a32f9ab26de3feb68a8dff20349b8f0))
- improve styling of hero image on index ([80f0bad](https://github.com/uzh-bf/gbl-web/commit/80f0bad1821d1b65b6614ac8298a88fc243c2c85))
- index page with heros and layouting changes ([8f55af0](https://github.com/uzh-bf/gbl-web/commit/8f55af015804abc9bac471402e43690eba997319))
- link hero images to pages ([41c3302](https://github.com/uzh-bf/gbl-web/commit/41c33021c3bbe4ef2e84f1d5f9291c9dc59d6764))
- redesign banner sections ([eb05483](https://github.com/uzh-bf/gbl-web/commit/eb05483287f61e1d21c95966d922a7ce5b5cd922))
- replace div icons with SVG and add icon layout for roadmap section ([ef0a932](https://github.com/uzh-bf/gbl-web/commit/ef0a9327908c3fcd8d33419fefa0535ffb62e4f3))
- slight rework of game detail page with tags ([3812c90](https://github.com/uzh-bf/gbl-web/commit/3812c9032583bdab5f41c1a91d3f14962a0ca591))
- update stakeholder icons to look clickable ([c39ffab](https://github.com/uzh-bf/gbl-web/commit/c39ffab17ebc5a0029537a5bfa78d04c9370366a))
- use uzh blue and bold font for buttons ([220bc2d](https://github.com/uzh-bf/gbl-web/commit/220bc2dfdb7009862e3b9560fef66ab1e6820966))
- use uzh blue for headers ([a66ea42](https://github.com/uzh-bf/gbl-web/commit/a66ea42a4316bdef20b987137743c78afb68af08))

### Bug Fixes

- add max width for dbf overview ([24446e0](https://github.com/uzh-bf/gbl-web/commit/24446e0c08a2bd940cab02f23ec27d81beb97766))
- ensure that the footer is overlayed on top of the page ([607a802](https://github.com/uzh-bf/gbl-web/commit/607a8020cc00500a6faa66b35beebeb08271f38b))
- hide overflow in the page body to ensure footer is shown ([282758e](https://github.com/uzh-bf/gbl-web/commit/282758e38f3aa8921afcc3a6fffab45c708e85a3))
- improve responsiveness of leading quote ([ca26bc7](https://github.com/uzh-bf/gbl-web/commit/ca26bc73a63f55e2c3ade3146c1d7227e61e295c))
- improvements to index consistency ([6bd2b95](https://github.com/uzh-bf/gbl-web/commit/6bd2b958a77c7db45b3449481125a52938c7b80e))
- reduce distance of quote border ([bd2e185](https://github.com/uzh-bf/gbl-web/commit/bd2e18537dbcf9971f7b49773abb1b1fb1bd04cf))
- revert back to footer z-indes and bg approach ([89e0a4a](https://github.com/uzh-bf/gbl-web/commit/89e0a4ad3ae6b71383a05df3c7aa5eff9cef30a4))

### Refactors

- extract useful components from index page ([3672ed8](https://github.com/uzh-bf/gbl-web/commit/3672ed89af7b5133c7a961a28ecf8c8fac4845cb))
- move section components to subdirectory ([eb91dc9](https://github.com/uzh-bf/gbl-web/commit/eb91dc903b661d0135b42682b26dc07596eb7885))

- add example rext for roadmap ([585d13a](https://github.com/uzh-bf/gbl-web/commit/585d13a0a654665285d88f9d1203f1f31e178339))
- add more types for semantic-version ([522637e](https://github.com/uzh-bf/gbl-web/commit/522637ea4031839bd52ef390fe9c50ecbd6ec2ab))
- add tailwind plugins ([212e739](https://github.com/uzh-bf/gbl-web/commit/212e7398c1947f9d5680fde177bc8b94ba428b58))
- add tailwind plugins to config ([a0d6286](https://github.com/uzh-bf/gbl-web/commit/a0d62868594f6eddd9d05889ec3595a425fb30fe))
- add ufin and link to the detail page ([6ec8272](https://github.com/uzh-bf/gbl-web/commit/6ec8272073928a09ca718e6e5162ed04b8dafc96))
- add uzh red for bg ([cfa7f24](https://github.com/uzh-bf/gbl-web/commit/cfa7f2404e53a65ef65fd50aa18c44b5c595f678))
- lockfile maintenance ([b6728a5](https://github.com/uzh-bf/gbl-web/commit/b6728a553fb9267098320100b469d0b28347b505))
- lockfile maintenance ([740d379](https://github.com/uzh-bf/gbl-web/commit/740d379e36ad65e0261dfb4110aceb8fae36b62d))
- padding on index ([7d0f942](https://github.com/uzh-bf/gbl-web/commit/7d0f94205339829c136a88b188f2d3c0b2d36c13))
- refactoring components ([6bac53c](https://github.com/uzh-bf/gbl-web/commit/6bac53c7c1faed135baac5016a266f8437784772))
- update dev workflow image with removed headers ([2ce0c8d](https://github.com/uzh-bf/gbl-web/commit/2ce0c8d579624f74e828a9d142e47e8089ce421a))

### [0.0.13](https://github.com/uzh-bf/gbl-web/compare/v0.0.12...v0.0.13) (2021-04-26)

### Features

- add link to hypernotes to the KB page ([6fa5d18](https://github.com/uzh-bf/gbl-web/commit/6fa5d1846546ac34a75def14f58b8d82783c002e))
- initial page ideas for dbf ([e448321](https://github.com/uzh-bf/gbl-web/commit/e4483210166e9df75bef946e34be5040fd30194c))
- initial stub structure for the main page ([950136d](https://github.com/uzh-bf/gbl-web/commit/950136db9b3eda8e6232d3afc966a8f6f78505d4))

### [0.0.12](https://github.com/uzh-bf/gbl-web/compare/v0.0.11...v0.0.12) (2021-04-24)

### Features

- stubs for breadcrumbs and footer, dynamic navigation ([b4adbdb](https://github.com/uzh-bf/gbl-web/commit/b4adbdb8c9298a8780761ed214c8a3ba2ab24006))

### [0.0.11](https://github.com/uzh-bf/gbl-web/compare/v0.0.10...v0.0.11) (2021-04-24)

### Features

- generalize the page title ([ccbe26a](https://github.com/uzh-bf/gbl-web/commit/ccbe26a2d1bac7af3ca1357555b51f98ca585371))
- prepare pages for the overall site structure ([930911d](https://github.com/uzh-bf/gbl-web/commit/930911de8f7897344e777aac4bb09ac4341a9c86))
- working navigation ([6cfc762](https://github.com/uzh-bf/gbl-web/commit/6cfc762071d3d28ad2249d4520b470970b7b9e0e))

### [0.0.10](https://github.com/uzh-bf/gbl-web/compare/v0.0.9...v0.0.10) (2021-04-24)

### Features

- add footer ([4fe8791](https://github.com/uzh-bf/gbl-web/commit/4fe8791980b4eab4dce803eda9c8f9c44ca560ba))
- add initial links to navigation items ([a1157c2](https://github.com/uzh-bf/gbl-web/commit/a1157c2c8db66b6c76da1f8d4b697a141c9846cc))
- restrict the maximum width of the page ([cc0d42c](https://github.com/uzh-bf/gbl-web/commit/cc0d42cfc93b5de3afd486efd55632a201b53b06))
- structural rework and initial homepage structure ([0bf0f13](https://github.com/uzh-bf/gbl-web/commit/0bf0f136cac382e13b82d0f6e5316c6d3ecd4ec2))

### Bug Fixes

- the max-width should not apply to the footer ([d960a7b](https://github.com/uzh-bf/gbl-web/commit/d960a7b55ca4e6542d4c266ebef9ecfc33b05c24))
- update purge paths to src/ directory ([e95ede0](https://github.com/uzh-bf/gbl-web/commit/e95ede02e34249b54efdb427aa498fab4a874c12))

### [0.0.9](https://github.com/uzh-bf/gbl-web/compare/v0.0.8...v0.0.9) (2021-04-03)

### [0.0.8](https://github.com/uzh-bf/gbl-web/compare/v0.0.7...v0.0.8) (2021-04-03)

### Features

- setup tailwind and basic page for games ([85739f0](https://github.com/uzh-bf/gbl-web/commit/85739f026265ac6b4bb089157f09c0ea4bf378fd))

### [0.0.7](https://github.com/uzh-bf/gbl-web/compare/v0.0.6...v0.0.7) (2021-04-03)

### Features

- add content fields for game pages ([e6e7e1e](https://github.com/uzh-bf/gbl-web/commit/e6e7e1e8f320ebae76bdb8d457fae2aac4f9cfab))

### [0.0.6](https://github.com/uzh-bf/gbl-web/compare/v0.0.5...v0.0.6) (2021-04-03)

### Bug Fixes

- path resolution to Util ([032ae3a](https://github.com/uzh-bf/gbl-web/commit/032ae3ac3f0ca2b663782fdba0271e05838c4544))

### [0.0.5](https://github.com/uzh-bf/gbl-web/compare/v0.0.4...v0.0.5) (2021-04-03)

### Features

- add games collection, refactor: extract getStaticPaths and getStaticProps into Util ([e164d87](https://github.com/uzh-bf/gbl-web/commit/e164d87cbe9af4047252ea6c864448c8961e5575))

### [0.0.4](https://github.com/uzh-bf/gbl-web/compare/v0.0.3...v0.0.4) (2021-04-03)

### Bug Fixes

- ensure that empty directories are kept in git ([79be05a](https://github.com/uzh-bf/gbl-web/commit/79be05a51b5b47b22755a4c3bdeabe974c6b2894))

### [0.0.3](https://github.com/uzh-bf/gbl-web/compare/v0.0.2...v0.0.3) (2021-04-03)

### Bug Fixes

- path resolution in getStaticProps and getStaticPaths ([1a7acaf](https://github.com/uzh-bf/gbl-web/commit/1a7acaf129f8b744c6e1b081cb415d699d403ece))

### [0.0.2](https://github.com/uzh-bf/gbl-web/compare/v0.0.1...v0.0.2) (2021-04-03)

### Features

- setup standard-version ([d531cf6](https://github.com/uzh-bf/gbl-web/commit/d531cf64406f071deccd38f98c67b558bde1d68f))

### 0.0.1 (2021-04-03)

### Features

- dynamically create pages based on contents of the content/pages dir ([7cd1c09](https://github.com/uzh-bf/gbl-web/commit/7cd1c09f0fd6f70535be618759e59f1a3bbe4ddb))
- reinitialize with a custom next.js setup [#1](https://github.com/uzh-bf/gbl-web/issues/1) ([242ad5e](https://github.com/uzh-bf/gbl-web/commit/242ad5e2b88046dca9f024a3a89abab1562fa400))

### Bug Fixes

- use the out/ dir for netlify deployment ([f1d51e4](https://github.com/uzh-bf/gbl-web/commit/f1d51e44845c1209b62b9a6aee575c75cde93bca))
