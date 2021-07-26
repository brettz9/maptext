import {jml} from '../../external/jamilih/dist/jml-es.js';

import editPolyXY from './editPolyXY.js';

const formControlsPoly = ({
  outputArea, currentImageRegionID
}) => {
  return jml('div', {class: 'polyDivHolder'}, [
    editPolyXY(currentImageRegionID, true)
  ], outputArea);
};

export default formControlsPoly;
