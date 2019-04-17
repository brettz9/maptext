/* globals jQuery */
import {jml, nbsp} from '../../node_modules/jamilih/dist/jml-es.js';
import jqueryImageMaps from '../../node_modules/imagemaps/dist/index.esm.js';
import _ from '../../external/i18n/i18n.js';

const $ = jqueryImageMaps(jQuery);

const nbsp2 = nbsp.repeat(2);

export const makeFrom = () => {
  return ['span', {class: 'from'}, [_('From:')]];
};
export const makeTo = () => ['span', [_('To:')]];

export const formControlsRect = ({currentImageRegionID, outputArea}) => {
  jml('div', [
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

export const formControlsCircle = ({currentImageRegionID, outputArea}) => {
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

export const formControlsPoly = ({
  currentImageRegionID, outputArea, behaviors
}) => {
  const div = jml('div', {class: 'polyDivHolder'}, [
    behaviors.makePolyXY(currentImageRegionID)
  ], outputArea);
  div.querySelector('button.addPoly').click();
};

export const formText = ({
  imgRegionID, currentImageRegionID, outputArea, li,
  behaviors
}) => {
  jml('div', [
    ['div', [
      ['label', [
        _('Text'), nbsp2,
        ['textarea', {
          name: `${currentImageRegionID}_text`,
          required: true
        }]
      ]]
    ]],
    ['button', {class: 'addRegion', $on: {click (e) {
      e.preventDefault();
      behaviors.addImageRegion(imgRegionID++, li);
    }}}, [
      _('+')
    ]],
    ['button', {class: 'removeRegion', $on: {click (e) {
      e.preventDefault();
      const imageRegions = $('#imageRegions')[0];
      if (imageRegions.children.length === 1) {
        return;
      }
      li.remove();
    }}}, [
      _('-')
    ]],
    ['br'],
    ['br']
  ], outputArea);
};
