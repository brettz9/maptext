import {promises as fs} from 'fs';
import {join} from 'path';

(async () => {
//
const dirs = await fs.readdir(join(__dirname, 'unit'));
dirs.forEach((file) => {
  import('./' + join('unit', file));
});
//
})();
