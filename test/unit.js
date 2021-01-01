/* eslint-disable compat/compat */
import {promises as fs} from 'fs';
import {join, dirname} from 'path';

const isWindows = process.platform === 'win32';

/**
 * @param {string} path
 * @returns {string}
 */
function fixWindowsPath (path) {
  return path.slice(
    // istanbul ignore next
    isWindows ? 1 : 0
  );
}

// Node should be ok with this, but transpiling
//  to `require` doesn't work, so detect Windows
//  to remove slash instead
// "file://" +
const thisDirectory = fixWindowsPath(
  dirname(new URL(import.meta.url).pathname)
);

(async () => {
//
const dirs = await fs.readdir(join(thisDirectory, 'unit'));
dirs.forEach((file) => {
  // todo[engine:node@>14]: See about removing these warnings
  // eslint-disable-next-line max-len
  // eslint-disable-next-line node/no-unsupported-features/es-syntax, no-unsanitized/method
  import('./' + join('unit', file));
});
//
})();
