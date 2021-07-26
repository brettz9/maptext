import {jml, nbsp} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const nbsp2 = nbsp.repeat(2);

const formControlsRect = ({currentImageRegionID, outputArea}) => {
  return jml('div', [
    ['label', [
      _('Left x'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_leftx`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('Top y'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_topy`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('Right x'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_rightx`,
        type: 'number', size: 5, required: true, value: 300
      }]
    ]], nbsp2,
    ['label', [
      _('Bottom y'),
      nbsp,
      ['input', {
        name: `${currentImageRegionID}_bottomy`,
        type: 'number', size: 5, required: true, value: 300
      }]
    ]], nbsp2
  ], outputArea);
};

export default formControlsRect;
