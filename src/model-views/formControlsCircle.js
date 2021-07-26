import {jml, nbsp} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const nbsp2 = nbsp.repeat(2);

const formControlsCircle = ({currentImageRegionID, outputArea}) => {
  return jml('div', [
    ['label', [
      _('x'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_circlex`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('y'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_circley`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('r'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_circler`,
        type: 'number', size: 5, required: true, value: 30
      }]
    ]]
  ], outputArea);
};

export default formControlsCircle;
