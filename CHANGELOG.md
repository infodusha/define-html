# Changelog

## [3.0.0](https://github.com/infodusha/define-html/compare/v2.6.0...v3.0.0) (2024-07-30)


### ⚠ BREAKING CHANGES

* shadow DOM is always used
* data-shadow is always open
* data-selector is obsolete, just always use filename
* shadow dom now has global styles inside
* no need to write type for component scripts
* instead of data-global just paste your styles and script into the page

### Features

* add appendStyle method ([8a02f5b](https://github.com/infodusha/define-html/commit/8a02f5b7daca802e076ffe821662d26f998ab18f))
* all scripts are ES modules now ([519c8d7](https://github.com/infodusha/define-html/commit/519c8d72f55da02026da2d9e5c91dcf617af1e0d))
* data-selector is not used anymore ([0b7ee2d](https://github.com/infodusha/define-html/commit/0b7ee2d93dd7fe4944b5e505cf8e177bf6f00b11))
* data-shadow don't need a value anymore ([11a7e73](https://github.com/infodusha/define-html/commit/11a7e7376d4fadc426df872d89a5e50314fb668a))
* group component styles ([ca9b396](https://github.com/infodusha/define-html/commit/ca9b396dfd52570ae58cb73e26582c93447c86eb))
* no more data-global attribute ([b99d785](https://github.com/infodusha/define-html/commit/b99d785a936d6653e7ce5cdcb7163e460cbb9df3))
* **runtime:** handle load errors ([1ca4834](https://github.com/infodusha/define-html/commit/1ca48343e8f1493f068b4559bde2300a9078aa52))
* shadow DOM is always used ([4cf5a49](https://github.com/infodusha/define-html/commit/4cf5a49c99211a0ecaa97d9558bd05d3590cb6a4))
* updates + shadow works as expected ([9eb730f](https://github.com/infodusha/define-html/commit/9eb730f9c731c3eed596bd203f3548c2568cb771))


### Bug Fixes

* copy global styles ([baf3d25](https://github.com/infodusha/define-html/commit/baf3d25ca9b53500f32ac40f1c4e2f7de6f183f6))
* tests ([359f8ea](https://github.com/infodusha/define-html/commit/359f8ea524bff7ceb5f616f84155bf65ac2c291f))
* update package json ([f405ce7](https://github.com/infodusha/define-html/commit/f405ce7604402d1fc44210a531dd5a1d1f471218))

## [2.6.0](https://github.com/infodusha/define-html/compare/v2.5.0...v2.6.0) (2024-07-22)


### Features

* **compiler:** add runtime copy ([3104cca](https://github.com/infodusha/define-html/commit/3104ccabfe3f6cd9d24fd33ad9f2d858f10b11d0))

## [2.5.0](https://github.com/infodusha/define-html/compare/v2.4.2...v2.5.0) (2024-07-22)


### Features

* outdir for compiler ([045d782](https://github.com/infodusha/define-html/commit/045d782ff1d6a4576af7cc22fe46e0cc8c5d24e7))
* replace jsdom with cheerio ([adfe095](https://github.com/infodusha/define-html/commit/adfe09553cf65fa59ec256ff626731b94b593cce))

## [2.4.2](https://github.com/infodusha/define-html/compare/v2.4.1...v2.4.2) (2024-07-22)


### Bug Fixes

* make bin work ([f5f650a](https://github.com/infodusha/define-html/commit/f5f650ad9bf9f552deaed5394b7d7fb17050df4c))

## [2.4.1](https://github.com/infodusha/define-html/compare/v2.4.0...v2.4.1) (2024-07-22)


### Bug Fixes

* build compiler ([f53be7c](https://github.com/infodusha/define-html/commit/f53be7cf7a7e1a384c6cd7b47f220c04d8657f36))

## [2.4.0](https://github.com/infodusha/define-html/compare/v2.3.0...v2.4.0) (2024-07-22)


### Features

* add biome ([50bf902](https://github.com/infodusha/define-html/commit/50bf90280fde6112ef30edbb3cbdddbd8b2e1e16))
* add docs ([1884ce1](https://github.com/infodusha/define-html/commit/1884ce17af3055f695f7bce0037f60bdec769465))
* add more docs ([3d3b7a3](https://github.com/infodusha/define-html/commit/3d3b7a3cbafc13c492bb5983b3a13cd00aa4b664))
* introduce compiler ([9b8e3d8](https://github.com/infodusha/define-html/commit/9b8e3d8d8758dbd5c2249c35a91be0554afaebee))

## [2.3.0](https://github.com/infodusha/define-html/compare/v2.2.1...v2.3.0) (2023-09-13)


### Features

* move to bun again ([038af1d](https://github.com/infodusha/define-html/commit/038af1d5099c6fced61e27a830240939b95cc9ff))

## [2.2.1](https://github.com/infodusha/define-html/compare/v2.2.0...v2.2.1) (2023-09-12)


### Bug Fixes

* rollback bun ([a54ad4b](https://github.com/infodusha/define-html/commit/a54ad4b640f252675bf5e4a26bdad88f08964596))

## [2.2.0](https://github.com/infodusha/define-html/compare/v2.3.0...v2.2.0) (2023-09-12)


### ⚠ BREAKING CHANGES

* properties can now remove attributes
* remove(add) optional elements from(in) DOM

### Features

* add motivation ([ab21e56](https://github.com/infodusha/define-html/commit/ab21e56a559f343ec25468a823a4766c315d0fa5))
* add playwright ([e23d478](https://github.com/infodusha/define-html/commit/e23d47883317ba74052254795128ae08221a050f))
* add support for data-if-equal ([19b4e60](https://github.com/infodusha/define-html/commit/19b4e604623c801dd67c7ab75f77032408c326a4))
* attrs have defaults ([01b3828](https://github.com/infodusha/define-html/commit/01b3828fed2c3a5cd7044d7825f3deb01436e882))
* better example ([328d463](https://github.com/infodusha/define-html/commit/328d463d840163dda6e5dfe2aa56de2896757628))
* better slot support ([ff8b575](https://github.com/infodusha/define-html/commit/ff8b5752ac152b7e57be50c4742f55ed6a527061))
* data-if changes from js support ([e69a8f0](https://github.com/infodusha/define-html/commit/e69a8f07c0baee83725b16a3c44cfdb935d08d03))
* data-shadow can be a mode ([28b4e4f](https://github.com/infodusha/define-html/commit/28b4e4f0da9bc1e5ed97ba020ea880245692d364))
* extend script modules support ([fdf2b85](https://github.com/infodusha/define-html/commit/fdf2b85b0b9c606fd46259cd038f8bb6cd3082b7))
* fix slots & extract css helpers ([220c2c7](https://github.com/infodusha/define-html/commit/220c2c71e2846192f3c2b654b061453ec070d6e1))
* full slot support ([dc0bce5](https://github.com/infodusha/define-html/commit/dc0bce5161294cd15566c50e87127447e4386838))
* full style encapsulation ([7a76862](https://github.com/infodusha/define-html/commit/7a76862e324d7eeae3275afe6e52c38fd2a57a2a))
* import css as separate files ([f69f8c5](https://github.com/infodusha/define-html/commit/f69f8c5e2ac43f233c061ea32477d0867a5fd6d6))
* initial commit ([72180ad](https://github.com/infodusha/define-html/commit/72180ad05a0e0854076334839409bd91807db8b3))
* move on typescript ([ed14b89](https://github.com/infodusha/define-html/commit/ed14b89e7e1ff0c6af61081c98ec0b4de060c941))
* move to bun ([9d9a95e](https://github.com/infodusha/define-html/commit/9d9a95e25ae60806b4aff050e107a11fd2626fea))
* move to bun 1 ([84a1269](https://github.com/infodusha/define-html/commit/84a12690df51713bcb226cc58e096f668b694874))
* move to bun 2 ([c57f853](https://github.com/infodusha/define-html/commit/c57f8534bbb5d98b18983cb046a65de79ddd0d5f))
* observe for attribute changes ([f616803](https://github.com/infodusha/define-html/commit/f6168032277feac52a00cafb44bd91d91074f3d3))
* properties can now remove attributes ([ec65084](https://github.com/infodusha/define-html/commit/ec650845638678482958e6fde12127cc56efb525))
* refactor css part & add wat to make global style tag ([1fe29eb](https://github.com/infodusha/define-html/commit/1fe29eb0fd1256a18e3e6cd8329831cf0b4f15a7))
* refactor script executor ([be1e007](https://github.com/infodusha/define-html/commit/be1e00736e78666ae9358157931ee2996a5b5665))
* refactor structure ([cbb34b4](https://github.com/infodusha/define-html/commit/cbb34b4f7cfa7924defff1b2989a0665d91bbec5))
* remove(add) optional elements from(in) DOM ([b305c72](https://github.com/infodusha/define-html/commit/b305c72a2a3056864614df4fbf8d5e577f996465))
* script src woks ([f578b1f](https://github.com/infodusha/define-html/commit/f578b1f01227c2d3287b46cedce6b2a245ca3f3f))
* script support ([9b47052](https://github.com/infodusha/define-html/commit/9b470523edc2db39feebeeb2ecc2914806b66eac))
* selector read from filename ([882dc0c](https://github.com/infodusha/define-html/commit/882dc0c73d7ee24409877ef779caf16040096ce7))
* simplify attribute watching ([19d8a5a](https://github.com/infodusha/define-html/commit/19d8a5afab8d8d039825acaaa885ec8036d0560e))
* simplify readme ([0b1129d](https://github.com/infodusha/define-html/commit/0b1129dee5521865ceaf4d586b7d8a3d911e6934))


### Bug Fixes

* add http-server to dev deps ([393833c](https://github.com/infodusha/define-html/commit/393833cc47a0f177699b357cc87e0498cba911c8))
* module script tabs ([467d101](https://github.com/infodusha/define-html/commit/467d101afa5c8f827936b18d20995b657bd48494))
* refactor naming ([fc16203](https://github.com/infodusha/define-html/commit/fc16203cdbbb2e25b67e73fb2f3cac08dee6e692))
* rollback version ([32ce475](https://github.com/infodusha/define-html/commit/32ce4757eefb7959861486e3726bd791ef922325))
* run tests in different workflow ([82efe37](https://github.com/infodusha/define-html/commit/82efe371777a0e0e8348ec28b3a4530b846a5597))
* run tests in different workflow ([2d39abd](https://github.com/infodusha/define-html/commit/2d39abdfbb11dcc4ea7caef9b77733b04b031fad))
* run tests in different workflow ([68226ee](https://github.com/infodusha/define-html/commit/68226eea23924d78635b7d0694a28bd5f9e8040c))
* run tests in different workflow ([5ffe091](https://github.com/infodusha/define-html/commit/5ffe0913a2071c4666e922ab58acb794a90de6a2))
* run tests in different workflow ([9623776](https://github.com/infodusha/define-html/commit/9623776fe8704fa9a5bab9336c41e7a7225886ce))
* script module relative imports work ([41935da](https://github.com/infodusha/define-html/commit/41935da3f2a477a61961ef3a6ac1278830795ffc))
* strip comments on build ([a84c5b3](https://github.com/infodusha/define-html/commit/a84c5b3f352c3b9fcc7a65bdc3ec4a2b5e20ab80))
* style tags & shadow mode ([1a48fbb](https://github.com/infodusha/define-html/commit/1a48fbb7b9d8c80b6ea60012962529bbcfd8955f))
* use getAttributeNames inside ([a74875b](https://github.com/infodusha/define-html/commit/a74875be94f18fa85a3f8e55b765e7648dbb030a))


### Miscellaneous Chores

* release 2.2.0 ([07e9b8f](https://github.com/infodusha/define-html/commit/07e9b8f3fdba81026a64083715a084023d02e559))

## [2.1.0](https://github.com/infodusha/define-html/compare/v2.0.0...v2.1.0) (2023-09-07)


### Features

* selector read from filename ([882dc0c](https://github.com/infodusha/define-html/commit/882dc0c73d7ee24409877ef779caf16040096ce7))

## [2.0.0](https://github.com/infodusha/define-html/compare/v1.10.0...v2.0.0) (2023-09-02)


### ⚠ BREAKING CHANGES

* properties can now remove attributes
* remove(add) optional elements from(in) DOM

### Features

* data-shadow can be a mode ([28b4e4f](https://github.com/infodusha/define-html/commit/28b4e4f0da9bc1e5ed97ba020ea880245692d364))
* properties can now remove attributes ([ec65084](https://github.com/infodusha/define-html/commit/ec650845638678482958e6fde12127cc56efb525))
* remove(add) optional elements from(in) DOM ([b305c72](https://github.com/infodusha/define-html/commit/b305c72a2a3056864614df4fbf8d5e577f996465))

## [1.10.0](https://github.com/infodusha/define-html/compare/v1.9.0...v1.10.0) (2023-09-02)


### Features

* refactor script executor ([be1e007](https://github.com/infodusha/define-html/commit/be1e00736e78666ae9358157931ee2996a5b5665))

## [1.9.0](https://github.com/infodusha/define-html/compare/v1.8.2...v1.9.0) (2023-09-02)


### Features

* attrs have defaults ([01b3828](https://github.com/infodusha/define-html/commit/01b3828fed2c3a5cd7044d7825f3deb01436e882))
* better example ([328d463](https://github.com/infodusha/define-html/commit/328d463d840163dda6e5dfe2aa56de2896757628))
* script src woks ([f578b1f](https://github.com/infodusha/define-html/commit/f578b1f01227c2d3287b46cedce6b2a245ca3f3f))


### Bug Fixes

* script module relative imports work ([41935da](https://github.com/infodusha/define-html/commit/41935da3f2a477a61961ef3a6ac1278830795ffc))

## [1.8.2](https://github.com/infodusha/define-html/compare/v1.8.1...v1.8.2) (2023-08-27)


### Bug Fixes

* run tests in different workflow ([82efe37](https://github.com/infodusha/define-html/commit/82efe371777a0e0e8348ec28b3a4530b846a5597))
* run tests in different workflow ([2d39abd](https://github.com/infodusha/define-html/commit/2d39abdfbb11dcc4ea7caef9b77733b04b031fad))
* run tests in different workflow ([68226ee](https://github.com/infodusha/define-html/commit/68226eea23924d78635b7d0694a28bd5f9e8040c))
* run tests in different workflow ([5ffe091](https://github.com/infodusha/define-html/commit/5ffe0913a2071c4666e922ab58acb794a90de6a2))
* run tests in different workflow ([9623776](https://github.com/infodusha/define-html/commit/9623776fe8704fa9a5bab9336c41e7a7225886ce))

## [1.8.1](https://github.com/infodusha/define-html/compare/v1.8.0...v1.8.1) (2023-08-27)


### Bug Fixes

* add http-server to dev deps ([393833c](https://github.com/infodusha/define-html/commit/393833cc47a0f177699b357cc87e0498cba911c8))

## [1.8.0](https://github.com/infodusha/define-html/compare/v1.7.0...v1.8.0) (2023-08-27)


### Features

* add playwright ([e23d478](https://github.com/infodusha/define-html/commit/e23d47883317ba74052254795128ae08221a050f))
* better slot support ([ff8b575](https://github.com/infodusha/define-html/commit/ff8b5752ac152b7e57be50c4742f55ed6a527061))


### Bug Fixes

* strip comments on build ([a84c5b3](https://github.com/infodusha/define-html/commit/a84c5b3f352c3b9fcc7a65bdc3ec4a2b5e20ab80))

## [1.7.0](https://github.com/infodusha/define-html/compare/v1.6.1...v1.7.0) (2023-08-25)


### Features

* data-if changes from js support ([e69a8f0](https://github.com/infodusha/define-html/commit/e69a8f07c0baee83725b16a3c44cfdb935d08d03))

## [1.6.1](https://github.com/infodusha/define-html/compare/v1.6.0...v1.6.1) (2023-08-25)


### Bug Fixes

* module script tabs ([467d101](https://github.com/infodusha/define-html/commit/467d101afa5c8f827936b18d20995b657bd48494))
* refactor naming ([fc16203](https://github.com/infodusha/define-html/commit/fc16203cdbbb2e25b67e73fb2f3cac08dee6e692))

## [1.6.0](https://github.com/infodusha/define-html/compare/v1.5.0...v1.6.0) (2023-08-25)


### Features

* add support for data-if-equal ([19b4e60](https://github.com/infodusha/define-html/commit/19b4e604623c801dd67c7ab75f77032408c326a4))
* extend script modules support ([fdf2b85](https://github.com/infodusha/define-html/commit/fdf2b85b0b9c606fd46259cd038f8bb6cd3082b7))

## [1.5.0](https://github.com/infodusha/define-html/compare/v1.4.0...v1.5.0) (2023-08-25)


### Features

* move on typescript ([ed14b89](https://github.com/infodusha/define-html/commit/ed14b89e7e1ff0c6af61081c98ec0b4de060c941))

## [1.4.0](https://github.com/infodusha/define-html/compare/v1.3.0...v1.4.0) (2023-08-25)


### Features

* fix slots & extract css helpers ([220c2c7](https://github.com/infodusha/define-html/commit/220c2c71e2846192f3c2b654b061453ec070d6e1))
* full slot support ([dc0bce5](https://github.com/infodusha/define-html/commit/dc0bce5161294cd15566c50e87127447e4386838))
* full style encapsulation ([7a76862](https://github.com/infodusha/define-html/commit/7a76862e324d7eeae3275afe6e52c38fd2a57a2a))

## [1.3.0](https://github.com/infodusha/define-html/compare/v1.2.0...v1.3.0) (2023-08-24)


### Features

* simplify attribute watching ([19d8a5a](https://github.com/infodusha/define-html/commit/19d8a5afab8d8d039825acaaa885ec8036d0560e))

## [1.2.0](https://github.com/infodusha/define-html/compare/v1.1.0...v1.2.0) (2023-08-24)


### Features

* refactor css part & add wat to make global style tag ([1fe29eb](https://github.com/infodusha/define-html/commit/1fe29eb0fd1256a18e3e6cd8329831cf0b4f15a7))

## [1.1.0](https://github.com/infodusha/define-html/compare/v1.0.1...v1.1.0) (2023-08-24)


### Features

* add motivation ([ab21e56](https://github.com/infodusha/define-html/commit/ab21e56a559f343ec25468a823a4766c315d0fa5))
* import css as separate files ([f69f8c5](https://github.com/infodusha/define-html/commit/f69f8c5e2ac43f233c061ea32477d0867a5fd6d6))
* observe for attribute changes ([f616803](https://github.com/infodusha/define-html/commit/f6168032277feac52a00cafb44bd91d91074f3d3))
* refactor structure ([cbb34b4](https://github.com/infodusha/define-html/commit/cbb34b4f7cfa7924defff1b2989a0665d91bbec5))
* script support ([9b47052](https://github.com/infodusha/define-html/commit/9b470523edc2db39feebeeb2ecc2914806b66eac))
* simplify readme ([0b1129d](https://github.com/infodusha/define-html/commit/0b1129dee5521865ceaf4d586b7d8a3d911e6934))


### Bug Fixes

* use getAttributeNames inside ([a74875b](https://github.com/infodusha/define-html/commit/a74875be94f18fa85a3f8e55b765e7648dbb030a))

## [1.0.1](https://github.com/infodusha/define-html/compare/v1.0.0...v1.0.1) (2023-08-23)


### Bug Fixes

* style tags & shadow mode ([1a48fbb](https://github.com/infodusha/define-html/commit/1a48fbb7b9d8c80b6ea60012962529bbcfd8955f))

## 1.0.0 (2023-08-23)


### Features

* initial commit ([72180ad](https://github.com/infodusha/define-html/commit/72180ad05a0e0854076334839409bd91807db8b3))
