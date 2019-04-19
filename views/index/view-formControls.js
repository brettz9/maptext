import {jml, nbsp} from '../../node_modules/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const nbsp2 = nbsp.repeat(2);

export const mainForm = ({defaultMapName, defaultImageSrc, behaviors}) => {
  const form = jml('form', {
    id: 'imageForm',
    $on: {submit: behaviors.imageFormSubmit}
  }, [
    ['label', [
      _('Image map name'), nbsp2,
      ['input', {
        name: 'name', size: 100,
        value: defaultMapName
      }]
    ]],
    ['br'],
    ['label', [
      _('Image map URL'), nbsp2,
      ['input', {
        name: 'mapURL', size: 100, required: true,
        value: defaultImageSrc
      }]
    ]],
    ['br'],
    ['fieldset', [
      ['div', [
        _('Image areas'),
        ['ol', {id: 'imageRegions'}]
      ]]
    ]],
    ['input', {type: 'submit', value: _('Apply'), $on: {
      click: behaviors.submitFormClick
    }}]
  ]);
  return form;
};

export const formShapeSelection = ({currentImageRegionID, behaviors}) => {
  return jml('li', [
    ['select', {
      name: `${currentImageRegionID}_shape`,
      'aria-label': _('Shape'),
      $on: {change: behaviors.shapeSelectionChange}
    }, [
      ['option', {value: 'rect'}, [_('Rectangle')]],
      ['option', {value: 'circle'}, [_('Circle')]],
      // Todo: Disable after testing!
      // Todo: https://github.com/naver/image-maps/issues/9
      ['option', {value: 'poly'}, [_('Polygon')]]
    ]],
    ['div']
  ]);
};

export const formControlsRect = ({currentImageRegionID, outputArea}) => {
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
  outputArea, behaviors
}) => {
  return jml('div', {class: 'polyDivHolder'}, [
    behaviors.makePolyXY()
  ], outputArea);
};

export const makeFrom = () => {
  return ['span', {class: 'from'}, [_('From:')]];
};
export const makeTo = () => ['span', [_('To:')]];

export const polyXYDiv = ({from, currImageRegionID, behaviors}) => {
  return jml('div', [
    from
      ? makeFrom()
      : makeTo(),
    nbsp2,
    ['label', [
      _('x'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('y'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]],
    nbsp2,
    ['button', {class: 'addPoly', $on: {
      click: behaviors.addPolyClick
    }}, [
      '+'
    ]],
    ['button', {class: 'removePoly', $on: {
      click: behaviors.removePolyClick
    }}, [
      '-'
    ]]
  ]);
};

export const formText = ({
  currentImageRegionID, outputArea,
  behaviors
}) => {
  return jml('div', [
    ['div', [
      ['label', [
        _('Text'), nbsp2,
        ['textarea', {
          name: `${currentImageRegionID}_text`,
          required: true
        }]
      ]]
    ]],
    ['button', {class: 'addRegion', dataset: {
      regionId: currentImageRegionID
    }, $on: {
      click: behaviors.addImageRegionClick
    }}, [
      _('+')
    ]],
    ['button', {class: 'removeRegion', dataset: {
      regionId: currentImageRegionID
    }, $on: {
      click: behaviors.removeImageRegionClick
    }}, [
      _('-')
    ]],
    ['br'],
    ['br']
  ], outputArea);
};
