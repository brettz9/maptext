import {promises as fs} from 'fs';
import {join} from 'path';

(async () => {
//
const dirs = await fs.readdir(join(__dirname, 'unit'));
dirs.forEach((file) => {
  // eslint-disable-next-line no-unused-expressions
  import('./' + join('unit', file));
});
//
})();
