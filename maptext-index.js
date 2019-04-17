/* eslint-disable require-jsdoc */
import {jml, $} from './node_modules/jamilih/dist/jml-es.js';
import {
  serialize, deserialize
} from './node_modules/form-serialize/dist/index-es.js';

import tippy from './external/tippy.js/tippy.js';
// Todo: Switch to npm version
import _ from './external/i18n/i18n.js';
import {empty} from './external/dom-behaviors/dom-behaviors.js';

import * as Views from './views/index/view-index.js';
import * as Styles from './styles/index.js';
import * as ImageMaps from './behaviors/jqueryImageMaps.js';

// CONFIG
// Todo: Detect locale and set this in such a utility, etc.
document.documentElement.lang = 'en-US';
document.documentElement.dir = 'ltr';

// Todo: Could allow for multiple image maps
let polyID = 0;
let imgRegionID = 0;
const mapID = 0;
const defaultMapName = `map${mapID}`;
const defaultImageSrc = 'Handwriting_of_Shoghi_Effendi_1919-1.jpg';

let form;

function makePolyXY (currImageRegionID) {
  polyID++;
  const polyDiv = Views.polyXYDiv({
    polyID,
    currImageRegionID,
    behaviors: {
      addPolyClick (e) {
        e.preventDefault();
        polyDiv.after(makePolyXY(currImageRegionID));
      },
      removePolyClick (e) {
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
      }
    }
  });
  return polyDiv;
}

function addImageRegion (imageRegionID, prevElement) {
  const currentImageRegionID = imageRegionID;
  const li = Views.formShapeSelection({
    currentImageRegionID,
    behaviors: {
      shapeSelectionChange ({target}) {
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
            outputArea, li,
            behaviors: {
              makePolyXY () {
                makePolyXY(currentImageRegionID);
              }
            }
          });
          div.querySelector('button.addPoly').click();
          break;
        } default:
          break;
        }
        Views.formText({
          currentImageRegionID, outputArea,
          behaviors: {
            addImageRegionClick (e) {
              e.preventDefault();
              addImageRegion(imgRegionID++, li);
            },
            removeImageRegionClick (e) {
              e.preventDefault();
              const imageRegions = $('#imageRegions');
              if (imageRegions.children.length === 1) {
                return;
              }
              li.remove();
            }
          }
        });
      }
    }
  });
  if (prevElement) {
    prevElement.after(li);
  } else {
    jml(li, $('#imageRegions'));
  }
  li.firstElementChild.dispatchEvent(new Event('change'));
}

function updateSerializedHTML () {
  $('#serializedHTML').value =
    $('#imagePreviewHolder').firstElementChild.outerHTML;
}

function updateSerializedJSON (formObj) {
  $('#serializedJSON').value =
    JSON.stringify(formObj, null, 2);
}

function deserializeForm (formObj) {
  const imageRegions = $('#imageRegions');
  empty(imageRegions);
  let highestID = -1;
  Object.entries(formObj).forEach(([key, shape]) => {
    if (!key.endsWith('_shape')) {
      return;
    }
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

// Todo: We could use OOP with polymorphic methods instead,
//   avoiding its own instance method
/**
 *
 * @param {"form"|"map"|"html"|"json"} type
 * @param {PlainObject} formObj
 * @param {HTMLElement} [formControl] Control on which to report errors in
 *   form-building. Not needed if this is a change to the whole form.
 * @returns {void}
 */
function updateViews (type, formObj, formControl) {
  if (type !== 'form') {
    deserializeForm.call(formControl, formObj);
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
  ImageMaps.setFormObj(formObj);
}

function updateMap (formObj) {
  ImageMaps.removeAllShapes();
  setTimeout(() => {
    // const {name} = formObj; // Todo: Attach to map somehow
    mapImageMapFormObject(formObj, ({shape, alt, coords}) => {
      ImageMaps.addShape(shape, {coords});
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

function setFormObjCoords ({
  index, shape, coords, text, formObj, oldShapeToDelete
}) {
  formObj[index + '_shape'] = shape;
  formObj[index + '_text'] = text;
  switch (shape || oldShapeToDelete) {
  default:
    return;
  case 'circle':
    ['circlex', 'circley', 'circler'].forEach((item, i) => {
      formObj[index + '_' + item] = coords[i];
    });
    break;
  case 'rect':
    ['leftx', 'topy', 'rightx', 'bottomy'].forEach((item, i) => {
      formObj[index + '_' + item] = coords[i];
    });
    break;
  case 'poly':
    formObj[index + '_xy'] = coords;
    break;
  }
}

function setFormObjCoordsAndUpdateViewForMap ({
  index, shape, coords, text, formObj, formControl, oldShapeToDelete
}) {
  setFormObjCoords({index, shape, coords, text, formObj, oldShapeToDelete});
  updateViews('map', formObj, formControl);
}

function formToPreview (formObj) {
  const imagePreview = $('#imagePreview');
  const {name} = formObj;
  imagePreview.replaceWith(
    Views.imagePreview({
      name,
      src: $('input[name=mapURL]').value || (
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
  ImageMaps.setShapeStrokeFillOptions({
    fill: '#ffffff',
    stroke: 'red',
    'stroke-width': 2
  });
  ImageMaps.setImageMaps({formObj, sharedBehaviors: {
    setFormObjCoordsAndUpdateViewForMap
  }});
}

document.title = Views.title();

(async () => {
await Styles.load();

form = Views.mainForm({
  defaultMapName,
  defaultImageSrc: defaultImageSrc || '',
  behaviors: {
    imageFormSubmit (e) {
      e.preventDefault();
      const formObj = serialize(this, {hash: true});
      updateViews('form', formObj);
    },
    submitFormClick () {
      // To try again, we reset invalid forms, e.g., from previous bad JSON
      [...form.elements].forEach((ctrl) => {
        ctrl.setCustomValidity('');
      });
    }
  }
});

// const imageHeightWidthRatio = 1001 / 1024;
// const width = 450; // 1024;
// const height = width * imageHeightWidthRatio;

Views.main({
  form,
  behaviors: {
    serializedHTMLInput () {
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

      const formObj = {
        name: map.name,
        mapURL: img.src
      };
      areas.forEach(({shape, coords, alt}, index) => {
        if (!shape || !coords) {
          return;
        }
        coords = coords.split(/,\s*/u);
        setFormObjCoords({index, shape, coords, text: alt || '', formObj});
      });
      // alert(JSON.stringify(formObj, null, 2));
      updateViews('html', formObj, this);
    },
    serializedJSONInput () {
      let formObj;
      try {
        formObj = JSON.parse(this.value);
      } catch (err) {
        this.setCustomValidity(_('JSON Did not parse', err));
        this.reportValidity();
        return;
      }
      this.setCustomValidity('');

      updateViews('json', formObj, this);
    },
    rectClick (e) {
      e.preventDefault();
      ImageMaps.addRect({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    },
    circleClick (e) {
      e.preventDefault();
      ImageMaps.addCircle({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    },
    removeClick (e) {
      e.preventDefault();
      ImageMaps.removeShape({
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
    },
    removeAllClick (e) {
      e.preventDefault();
      ImageMaps.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    }
  }
});

addImageRegion(imgRegionID++);
})();
