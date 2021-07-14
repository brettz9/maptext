# maptext

## ?

### User-impacting

- License: Add license copy (MIT)
- Breaking change: Require Node 12
- Breaking change: Drop `core-js-bundle`, `regenerator-runtime`
- Enhancement: Find text feature
- Enhancement: View/View with guides/Edit mode
- Enhancement: Zooming
- Enhancement: Add remove/remove all shapes buttons
- Enhancement: Add circle button
- Enhancement: "Require text" preference
- Enhancement: Server/Login via `nogin`
- Enhancement: Better accessibility
- Enhancement: Button styling
- Enhancement: Copy selection
- Docs: Intro to project
- Docs: Add sample maptext data file
- Fix: Assorted misc. fixes
- Build: Update bundled external libs per updates
- npm: Ignore rollup config file
- npm: Update `eslint-config-ash-nazg`; add `browserslist`
- npm: Update `form-serialization`, `jamilih`, `simple-prefs`, `jquery`,
    `load-stylesheets`
- npm: update `tippy.js`, and add deps `imagemaps`/`jquery` for expected usage

### Dev-impacting

- Refactoring: Separation of concerns (styles, jQueryImageMaps)
- Testing: Allow `test` script to work with `start` in parallel
- Testing: Use `chai/register-expect`
- Testing: Add Cypress for UI testing
- Linting (ESLint): As per latest ash-nazg; check Markdown; check hidden files
- Linting (ESLint): Check RC file
- npm: Add `prepare` script to run `copy`
- npm: Switch to non-deprecated `@rollup/plugin-node-resolve`
- npm: Switch to pnpm
- npm: Update devDeps

## 0.1.0

- First barely functional version (Annotation via form, HTML, and/or JSON)
    with hover to get text

## 0.0.1

- Initial commit (Not yet functional)
