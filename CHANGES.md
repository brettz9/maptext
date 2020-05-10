# maptext

## ?

- Breaking change: Require Node 12 (for fs.promises)
- Build: Update bundled external libs per updates
- Update: Tippy, corejs, regenerator-runtime copies
- Testing: Allow `test` script to work with `start` in parallel
- Testing: Use chai/register-expect
- Linting (ESLint): As per latest ash-nazg
- Linting (ESLint): Check RC file
- npm: Add `prepare` script to run `copy`
- npm: Ignore rollup config file
- npm: Switch to non-deprecated `@rollup/plugin-node-resolve`
- npm: Update `eslint-config-ash-nazg`; add `browserslist`
- npm: Update devDeps, update tippy.js, and add deps:
  `imagemaps`/`jquery` for expected usage

## 0.1.0

- First barely functional version (Annotation via form, HTML, and/or JSON)
    with hover to get text

## 0.0.1

- Initial commit (Not yet functional)
