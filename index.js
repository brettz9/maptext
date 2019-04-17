/* globals jQuery */
/* eslint-disable require-jsdoc */
import {jml, nbsp} from './node_modules/jamilih/dist/jml-es.js';
import {
  serialize, deserialize
} from './node_modules/form-serialize/dist/index-es.js';
import jqueryImageMaps from './node_modules/imagemaps/dist/index.esm.js';

import tippy from './external/tippy.js/tippy.js';
import loadStylesheets from './node_modules/load-stylesheets/dist/index-es.js';
// Todo: Switch to npm version
import _ from './external/i18n/i18n.js';
import {empty} from './external/dom-behaviors/dom-behaviors.js';

import * as Views from './views/index/index.js';
import {
  setRect, setCircle, setEllipse,
  setShape, setShapeStrokeFillOptions
} from './behaviors/behaviors.js';

const $ = jqueryImageMaps(jQuery);

// CONFIG
// Todo: Detect locale, etc.
document.documentElement.lang = 'en-US';
document.documentElement.dir = 'ltr';
document.title = _('MapText demo');
// Todo: Could allow for multiple image maps
let polyID = 0;
let imgRegionID = 0;
const mapID = 0;
const defaultMapName = `map${mapID}`;
const defaultImageSrc = 'Handwriting_of_Shoghi_Effendi_1919-1.jpg';

setShapeStrokeFillOptions({
  fill: $('a.color.selected').data('color'),
  stroke: $('a.color.selected').data('color'),
  'stroke-width': 2
});

const nbsp2 = nbsp.repeat(2);

function makePolyXY (currImageRegionID) {
  polyID++;
  const polyDiv = jml('div', {id: 'polyID' + polyID}, [
    polyID === 1
      ? Views.makeFrom()
      : Views.makeTo(),
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
        fromOrTo.replaceWith(jml(...Views.makeFrom()));
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
    ['select', {
      name: `${currentImageRegionID}_shape`,
      'aria-label': _('Shape'),
      $on: {change ({target}) {
        const outputArea = this.nextElementSibling;
        empty(outputArea);
        switch (target.value) {
        case 'rect':
          Views.formControlsRect({currentImageRegionID, outputArea});
          break;
        case 'circle':
          Views.formControlsCircle({currentImageRegionID, outputArea});
          break;
        case 'poly': {
          const div = Views.formControlsPoly({
            currentImageRegionID, outputArea, li,
            behaviors: {makePolyXY}
          });
          div.querySelector('button.addPoly').click();
          break;
        } default:
          break;
        }
        Views.formText({
          currentImageRegionID, imgRegionID, outputArea,
          behaviors: {
            addImageRegionClick (e) {
              e.preventDefault();
              addImageRegion(imgRegionID++, li);
            },
            removeImageRegionClick (e) {
              e.preventDefault();
              const imageRegions = $('#imageRegions')[0];
              if (imageRegions.children.length === 1) {
                return;
              }
              li.remove();
            }
          }
        });
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
    jml(li, $('#imageRegions')[0]);
  }
  li.firstElementChild.dispatchEvent(new Event('change'));
}

function updateSerializedHTML () {
  $('#serializedHTML')[0].value =
    $('#imagePreviewHolder')[0].firstElementChild.outerHTML;
}

function updateSerializedJSON (formObj) {
  $('#serializedJSON')[0].value =
    JSON.stringify(formObj, null, 2);
}

function deserializeForm (form, formObj) {
  const imageRegions = $('#imageRegions')[0];
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
          $('.polyDivHolder')[0].append(makePolyXY(currID));
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
  './index.css'
]);

// Todo: We could use OOP with polymorphic methods instead,
//   avoiding its own instance method
/**
 *
 * @param {"form"|"map"|"html"|"json"} type
 * @param {PlainObject} formObj
 * @param {HTMLFormElement} [form] Form on which to report errors in
 *   form-building. Not needed if this is a change to the whole form.
 * @param {HTMLElement} [formControl] Control on which to report errors in
 *   form-building. Not needed if this is a change to the whole form.
 * @returns {void}
 */
function updateViews (type, formObj, form, formControl) {
  if (type !== 'form') {
    deserializeForm.call(formControl, form, formObj);
  }
  type !== 'map' && formToPreview(formObj); // Sets preview
  if (type !== 'map') {
    updateMap(formObj);
  }
  if (type !== 'html') {
    updateSerializedHTML();
  }
  if (type !== 'json') {
    updateSerializedJSON(formObj);
  }
}

function updateMap (formObj) {
  $('#preview').removeAllShapes();
  setTimeout(() => {
    // const {name} = formObj; // Todo: Attach to map somehow
    mapImageMapFormObject(formObj, ({shape, alt, coords}) => {
      setShape(shape, coords);
    });
  });
}

function mapImageMapFormObject (formObj, handler) {
  const formObjKeys = Object.keys(formObj);
  const shapeIDS = formObjKeys.filter((item) => {
    return item.endsWith('_shape');
  });

  return shapeIDS.map((shapeID) => {
    const shape = formObj[shapeID];
    const setNum = shapeID.slice(0, -('_shape'.length));
    const alt = formObj[setNum + '_text'];
    const coords = shape === 'circle'
      ? ['circlex', 'circley', 'circler'].map((item) => {
        return formObj[setNum + '_' + item];
      })
      : shape === 'rect'
        ? ['leftx', 'topy', 'rightx', 'bottomy'].map((item) => {
          return formObj[setNum + '_' + item];
        })
        // Poly
        : formObjKeys.filter((item) => {
          return item.startsWith(setNum) && item.endsWith('_xy');
        }).map((item) => {
          return formObj[item];
        });
    return handler({shape, alt, coords});
  });
}

function formToPreview (formObj) {
  const imagePreview = $('#imagePreview')[0];
  const {name} = formObj;
  imagePreview.replaceWith(
    Views.imagePreview({
      name,
      src: $('input[name=mapURL]')[0].value || (
        defaultImageSrc.startsWith('http')
          ? defaultImageSrc
          : location.href + '/' + defaultImageSrc
      ),
      behaviors: {
        mapImageMapFormObject (handler) {
          mapImageMapFormObject(formObj, ({coords, ...args}) => {
            handler({
              ...args,
              coords: coords.join(',')
            });
          });
        },
        mouseover () {
          this.dataset.tippyContent = this.alt;
          tippy('[data-tippy-content]', {
            followCursor: true,
            distance: 10,
            placement: 'right'
          });
        }
      }
    })
  );
  $('#preview').imageMaps({
    isEditMode: true,
    shape: 'rect',
    shapeStyle: {
      fill: '#ffffff',
      stroke: 'red',
      'stroke-width': 2
    },
    onClick (e, targetAreaHref) {
      // eslint-disable-next-line no-console
      console.log('click-targetAreaHref', targetAreaHref);
    },
    // onMouseDown (e, shapeType, coords) {},
    // We could use this but probably too aggressive
    // onMouseMove (e, shapeType, movedCoords) {},
    onMouseUp (e, shapeType, updatedCoords) {
      const targetEl = $(e.target);
      const index = targetEl.attr('data-index');
      const {type: shape} = this.getShapeInfo(index);

      // Won't change shape (and we don't change text here),
      //   so we only worry about coords (and only for the moved
      //   element)
      // eslint-disable-next-line no-console
      console.log('updatedCoords', updatedCoords);

      setFormObjCoords(formObj, shape, index, updatedCoords);

      updateViews('map', formObj, form, {
        reportValidity () {
          if (this.$message) {
            // alert(this.$message); // eslint-disable-line no-alert
            console.log('alert:', this.$message); // eslint-disable-line no-console, max-len
          }
        },
        setCustomValidity (msg) {
          if (!msg) {
            delete this.$message;
            return;
          }
          this.$message = msg;
        }
      });
    },
    onSelect (e, data) {
      console.log(data); // eslint-disable-line no-console
    }
  });
}

const form = jml('form', {id: 'imageForm', $on: {submit (e) {
  e.preventDefault();
  const formObj = serialize(this, {hash: true});
  updateViews('form', formObj);
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

// const imageHeightWidthRatio = 1001 / 1024;
// const width = 450; // 1024;
// const height = width * imageHeightWidthRatio;

function setFormObjCoords (formObj, shape, setNum, coords) {
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
}

jml('div', [
  form,
  ['section', {class: 'serialized'}, [
    ['h2', [_('Serialized HTML')]],
    ['textarea', {
      id: 'serializedHTML',
      form: form.id,
      'aria-label': _('Serialized HTML'),
      $on: {input () {
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
        areas.forEach(({shape, coords, alt}, setNum) => {
          if (!shape || !coords) {
            return;
          }
          formObj[setNum + '_shape'] = shape;
          formObj[setNum + '_text'] = alt || '';
          coords = coords.split(/,\s*/u);
          setFormObjCoords(formObj, shape, setNum, coords);
        });
        // alert(JSON.stringify(formObj, null, 2));
        updateViews('html', formObj, form, this);
      }}
    }]
  ]],
  ['section', {class: 'serialized'}, [
    ['h2', [_('Serialized JSON')]],
    ['textarea', {
      id: 'serializedJSON',
      form: form.id,
      'aria-label': _('Serialized JSON'),
      $on: {input () {
        let formObj;
        try {
          formObj = JSON.parse(this.value);
        } catch (err) {
          this.setCustomValidity(_('JSON Did not parse', err));
          this.reportValidity();
          return;
        }
        this.setCustomValidity('');

        updateViews('json', formObj, form, this);
      }}
    }]
  ]],
  Views.imagePreviewContainer({
    behaviors: {
      rectClick (e) {
        e.preventDefault();
        setRect();
      },
      circleClick (e) {
        e.preventDefault();
        setCircle();
      },
      ellipseClick (e) {
        e.preventDefault();
        setEllipse();
      },
      removeClick (e) {
        e.preventDefault();
        $('#preview').removeShape();
      },
      removeAllClick (e) {
        e.preventDefault();
        $('#preview').removeAllShapes();
      }
    }
  })
], Views.mainRole());

addImageRegion(imgRegionID++);
})();
