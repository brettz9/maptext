/* eslint-disable require-jsdoc */
import {jml, body, $, nbsp} from './node_modules/jamilih/dist/jml-es.js';
import {
  serialize, deserialize
} from './node_modules/form-serialize/dist/index-es.js';

import tippy from './node_modules/tippy.js/dist/esm/tippy.js';
import loadStylesheets from './node_modules/load-stylesheets/dist/index-es.js';

function _ (s, err) {
  return s + (err ? ` (${err.message})` : '');
}

function empty (el) {
  while (el.firstChild) {
    el.firstChild.remove();
  }
}

// CONFIG
document.title = _('MapText demo');
// Todo: Could allow for multiple image maps
let polyID = 0;
let imgRegionID = 0;
const mapID = 0;
const defaultMapName = `map${mapID}`;
const defaultImageSrc = 'Handwriting_of_Shoghi_Effendi_1919-1.jpg';
const nbsp2 = nbsp.repeat(2);

function makeFrom () {
  return ['span', {class: 'from'}, [_('From:')]];
}
function makePolyXY (currImageRegionID) {
  polyID++;
  const polyDiv = jml('div', {id: 'polyID' + polyID}, [
    polyID === 1
      ? makeFrom()
      : ['span', [_('To:')]],
    nbsp2,
    ['label', [
      _('x'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true
      }]
    ]], nbsp2,
    ['label', [
      _('y'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true
      }]
    ]],
    nbsp2,
    ['button', {class: 'addPoly', $on: {click (e) {
      e.preventDefault();
      polyDiv.after(makePolyXY(currImageRegionID));
    }}}, [
      '+'
    ]],
    ['button', {class: 'removePoly', $on: {click (e) {
      e.preventDefault();
      const buttonSets = e.target.parentElement.parentElement;
      if (buttonSets.children.length <= 2) {
        return;
      }
      const parentDiv = polyDiv.parentElement;
      polyDiv.remove();
      const fromOrTo = parentDiv.firstElementChild.firstElementChild;
      if (fromOrTo.className !== 'from') {
        fromOrTo.replaceWith(jml(...makeFrom()));
      }
    }}}, [
      '-'
    ]]
  ]);
  return polyDiv;
}

function addImageRegion (imageRegionID, prevElement) {
  const currentImageRegionID = imageRegionID;
  const li = jml('li', [
    ['select', {name: `${currentImageRegionID}_shape`, $on: {change ({target}) {
      const outputArea = this.nextElementSibling;
      empty(outputArea);
      switch (target.value) {
      case 'rect':
        jml('div', [
          ['label', [
            _('Left x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_leftx`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Top y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_topy`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Right x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_rightx`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Bottom y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_bottomy`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2
        ], outputArea);
        break;
      case 'circle':
        jml('div', [
          ['label', [
            _('x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circlex`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circley`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('r'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circler`,
              type: 'number', size: 5, required: true
            }]
          ]]
        ], outputArea);
        break;
      case 'poly': {
        const div = jml('div', {class: 'polyDivHolder'}, [
          makePolyXY(currentImageRegionID)
        ], outputArea);
        div.querySelector('button.addPoly').click();
        break;
      } default:
        break;
      }
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
          addImageRegion(imgRegionID++, li);
        }}}, [
          _('+')
        ]],
        ['button', {class: 'removeRegion', $on: {click (e) {
          e.preventDefault();
          const imageRegions = $('#imageRegions');
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
    }}}, [
      ['option', {value: 'rect'}, [_('Rectangle')]],
      ['option', {value: 'circle'}, [_('Circle')]],
      ['option', {value: 'poly'}, [_('Polygon')]]
    ]],
    ['div', []]
  ]);
  if (prevElement) {
    prevElement.after(li);
  } else {
    jml(li, $('#imageRegions'));
  }
  li.firstElementChild.dispatchEvent(new Event('change'));
}

function updateSerializedHTML () {
  $('#serializedHTML').value =
    $('#imagePreview').firstElementChild.outerHTML;
}

function updateSerializedJSON (formObj) {
  $('#serializedJSON').value =
    JSON.stringify(formObj, null, 2);
}

function deserializeForm (form, formObj) {
  const imageRegions = $('#imageRegions');
  empty(imageRegions);
  let highestID = -1;
  Object.entries(formObj).forEach(([key, shape]) => {
    if (key.endsWith('_shape')) {
      const currID = parseInt(key.slice(0, -('_shape'.length)));
      addImageRegion(currID);
      const lastRegion = imageRegions.lastElementChild;
      const shapeSelector = lastRegion.querySelector('select');
      shapeSelector.name = key; // Number in key may differ
      shapeSelector.selectedIndex = {rect: 0, circle: 1, poly: 2}[shape];
      shapeSelector.dispatchEvent(new Event('change'));
      if (shape === 'poly') {
        let polySets = formObj[currID + '_xy'].length / 2;
        while (polySets > 2) { // Always have at least 2
          $('.polyDivHolder').append(makePolyXY(currID));
          polySets--;
        }
      }
      if (currID > highestID) {
        highestID = currID;
      }
    }
  });
  imgRegionID = highestID + 1;
  try {
    deserialize(form, formObj);
  } catch (err) {
    this.setCustomValidity(_('Could not deserialize', err));
    this.reportValidity();
    return;
  }
  this.setCustomValidity('');
  // Bad values from JSON not allowed to even be set, so
  //   this is not activating
  // this.reportValidity();
}

(async () => {
await loadStylesheets([
  '../node_modules/tippy.js/dist/tippy.css',
  './index.css'
]);

function formToPreview (formObj) {
  const formObjKeys = Object.keys(formObj);
  const shapeIDS = formObjKeys.filter((item) => {
    return item.endsWith('_shape');
  });

  const imagePreview = $('#imagePreview');
  empty(imagePreview);
  const {name} = formObj;
  jml('div', [
    ['map', {name}, shapeIDS.map((shapeID) => {
      const shape = formObj[shapeID];
      const setNum = shapeID.slice(0, -('_shape'.length));
      return ['area', {
        shape,
        dataset: {
          text: formObj[setNum + '_text']
        },
        coords: shape === 'circle'
          ? ['circlex', 'circley', 'circler'].map((item) => {
            return formObj[setNum + '_' + item];
          }).join(',')
          : shape === 'rect'
            ? ['leftx', 'topy', 'rightx', 'bottomy'].map((item) => {
              return formObj[setNum + '_' + item];
            }).join(',')
            // Poly
            : formObjKeys.filter((item) => {
              return item.startsWith(setNum) && item.endsWith('_xy');
            }).map((item) => {
              return formObj[item];
            }).join(','),
        $on: {mouseover () {
          this.dataset.tippyContent = this.dataset.text;
          tippy('[data-tippy-content]', {
            followCursor: true,
            distance: 10,
            placement: 'right'
          });
        }}
      }];
    })],
    ['img', {
      id: 'preview',
      usemap: '#' + name,
      src: $('input[name=mapURL]').value || defaultImageSrc
    }]
  ], imagePreview);
}

const form = jml('form', {id: 'imageForm', $on: {submit (e) {
  e.preventDefault();
  const formObj = serialize(this, {hash: true});
  formToPreview(formObj);
  updateSerializedHTML();
  updateSerializedJSON(formObj);
}}}, [
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
      value: defaultImageSrc || ''
    }]
  ]],
  ['br'],
  ['fieldset', [
    ['div', [
      _('Image areas'),
      ['ol', {id: 'imageRegions'}]
    ]]
  ]],
  ['input', {type: 'submit', value: _('Apply'), $on: {click () {
    // To try again, we reset invalid forms, e.g., from previous bad JSON
    [...form.elements].forEach((ctrl) => {
      ctrl.setCustomValidity('');
    });
  }}}]
]);

jml('div', [
  form,
  ['section', {class: 'serialized'}, [
    ['h2', [_('Serialized HTML')]],
    ['textarea', {id: 'serializedHTML', form: form.id, $on: {input () {
      const html = new DOMParser().parseFromString(this.value, 'text/html');
      const map = html.querySelector('map[name]');
      const img = html.querySelector(
        `img[usemap="#${map.name}"][src]`
      );
      const areas = [...map.querySelectorAll('area')];
      if (!map || !areas.length || !img) {
        this.setCustomValidity(!map
          ? _('Missing <map name=> element ')
          : (!areas.length)
            ? _('Missing <area>')
            : _('Missing matching <img usemap= src=>'));
        this.reportValidity();
        return;
      }
      this.setCustomValidity('');

      const formObj = {};
      formObj.name = map.name;
      formObj.mapURL = img.src;
      areas.forEach(({shape, coords, dataset: {text}}, setNum) => {
        if (!shape || !coords) {
          return;
        }
        formObj[setNum + '_shape'] = shape;
        formObj[setNum + '_text'] = text || '';
        coords = coords.split(/,\s*/u);
        switch (shape) {
        default:
          return;
        case 'circle':
          ['circlex', 'circley', 'circler'].forEach((item, i) => {
            formObj[setNum + '_' + item] = coords[i];
          });
          break;
        case 'rect':
          ['leftx', 'topy', 'rightx', 'bottomy'].forEach((item, i) => {
            formObj[setNum + '_' + item] = coords[i];
          });
          break;
        case 'poly':
          formObj[setNum + '_xy'] = coords;
          break;
        }
      });
      // alert(JSON.stringify(formObj, null, 2));
      deserializeForm.call(this, form, formObj);
      updateSerializedJSON(formObj);
      formToPreview(formObj);
    }}}]
  ]],
  ['section', {class: 'serialized'}, [
    ['h2', [_('Serialized JSON')]],
    ['textarea', {id: 'serializedJSON', form: form.id, $on: {input () {
      let formObj;
      try {
        formObj = JSON.parse(this.value);
      } catch (err) {
        this.setCustomValidity(_('JSON Did not parse', err));
        this.reportValidity();
        return;
      }
      this.setCustomValidity('');

      deserializeForm.call(this, form, formObj);
      formToPreview(formObj);
      updateSerializedHTML();
    }}
    }]
  ]],
  ['section', [
    ['h2', [_('Image preview')]],
    ['div', {id: 'imagePreview'}]
  ]]
], body);

addImageRegion(imgRegionID++);
})();
