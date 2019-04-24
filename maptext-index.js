/* eslint-disable require-jsdoc */
import {jml, $, $$, body} from './node_modules/jamilih/dist/jml-es.js';
import {
  serialize, deserialize
} from './node_modules/form-serialization/dist/index-es.js';

import tippy from './external/tippy.js/tippy.js';
// Todo: Switch to npm version
import _ from './external/i18n/i18n.js';
import {empty} from './external/dom-behaviors/dom-behaviors.js';

import * as Views from './views/index/view-index.js';
import * as Styles from './styles/styles-index.js';
import * as ImageMaps from './behaviors/jqueryImageMaps.js';

import {SimplePrefs} from './node_modules/simple-prefs/dist/index.esm.js';

const prefs = new SimplePrefs({namespace: 'maptext-', defaults: {
  requireText: true,
  editMode: 'edit'
}});

// CONFIG
// Todo: Could allow for multiple image maps
const mapID = 0;
const defaultMapName = `map${mapID}`;
const defaultImageSrc =
  'sample-image-texts/Handwriting_of_Shoghi_Effendi_1919-1.jpg';

// Todo: Detect locale and set this in such a utility, etc.
document.documentElement.lang = 'en-US';
document.documentElement.dir = 'ltr';

let imgRegionID = 0;
let form;

function makePolyXY (currImageRegionID, from = false) {
  const polyDiv = Views.polyXYDiv({
    from,
    currImageRegionID,
    behaviors: {
      addPolyClick (e) {
        e.preventDefault();
        polyDiv.after(makePolyXY(currImageRegionID));
      },
      removePolyClick (e) {
        e.preventDefault();
        const buttonSets = polyDiv.parentElement;
        if (buttonSets.children.length <= 2) {
          return;
        }
        polyDiv.remove();
        const firstButtonSet = buttonSets.firstElementChild;
        const fromOrTo = firstButtonSet.firstElementChild;
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
                return makePolyXY(currentImageRegionID, true);
              }
            }
          });
          div.querySelector('button.addPoly').click();
          break;
        } default:
          break;
        }
        Views.formText({
          requireText,
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

function updateSerializedHTML (removeAll) {
  if (removeAll) {
    $('#serializedHTML').value = '';
    return;
  }
  $('#serializedHTML').value =
    $('#imagePreview').outerHTML;
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
      const polySetsStart = formObj[currID + '_xy'].length / 2;
      let polySets = polySetsStart;
      while (polySets > 2) { // Always have at least 2
        $('.polyDivHolder').append(
          makePolyXY(currID, polySets === polySetsStart)
        );
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
 * @param {boolean} removeAll
 * @returns {void}
 */
async function updateViews (type, formObj, formControl, removeAll) {
  if (type !== 'form') {
    deserializeForm.call(formControl, formObj);
  }
  if (!removeAll) {
    // Don't actually set the map and update; we
    if (type !== 'map') {
      await formToPreview(formObj); // Sets preview
    }
    // Even for map, we must update apparently because change in form changes
    //   positions within map
    await updateMap(formObj);
  }
  if (type !== 'html') {
    updateSerializedHTML(removeAll);
  }
  if (type !== 'json') {
    updateSerializedJSON(removeAll ? {} : formObj);
  }
  ImageMaps.setFormObj(formObj);
}

async function updateMap (formObj) {
  await ImageMaps.removeAllShapes();
  return Promise.all(
    imageMapFormObjectInfo(formObj).map(({shape, alt, coords}) => {
      return ImageMaps.addShape(shape, {coords});
    })
  );
}

function imageMapFormObjectInfo (formObj) {
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
    return {shape, alt, coords};
  });
}

function setFormObjCoords ({
  index, shape, coords, text, formObj, oldShapeToDelete
}) {
  if (shape === undefined) {
    delete formObj[index + '_shape'];
  } else {
    formObj[index + '_shape'] = shape;
  }
  if (text === undefined) {
    delete formObj[index + '_text'];
  } else {
    formObj[index + '_text'] = text;
  }
  function circleOrRect (item, i) {
    if (coords[i] === undefined) {
      delete formObj[index + '_' + item];
    } else {
      formObj[index + '_' + item] = coords[i];
    }
  }
  switch (shape || oldShapeToDelete) {
  default:
    return;
  case 'circle':
    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
    ['circlex', 'circley', 'circler'].forEach(circleOrRect);
    break;
  case 'rect':
    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
    ['leftx', 'topy', 'rightx', 'bottomy'].forEach(circleOrRect);
    break;
  case 'poly':
    formObj[index + '_xy'] = coords;
    break;
  }
}

async function setFormObjCoordsAndUpdateViewForMap ({
  index, shape, coords, text, formObj, formControl, oldShapeToDelete,
  removeAll
}) {
  setFormObjCoords({index, shape, coords, text, formObj, oldShapeToDelete});
  await updateViews('map', formObj, formControl, removeAll);
}

async function formToPreview (formObj) {
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
        imageMapFormObjectInfoMap (handler) {
          return imageMapFormObjectInfo(formObj).map(({coords, ...args}) => {
            return {
              ...args,
              coords: coords.join(',')
            };
          // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          }).map(handler);
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
  ImageMaps.setShapeStrokeFillOptions(Styles.shapeStyle);
  ImageMaps.setImageMaps({
    formObj,
    editMode: await prefs.getPref('editMode'),
    sharedBehaviors: {
      setFormObjCoordsAndUpdateViewForMap
    }
  });
}

document.title = Views.title();

let requireText;
(async () => {
await Styles.load();

requireText = await prefs.getPref('requireText');

form = Views.mainForm({
  defaultMapName,
  defaultImageSrc: defaultImageSrc || '',
  initialPrefs: {requireText},
  behaviors: {
    async requireText () {
      requireText = this.checked;
      $$('.requireText').forEach((textarea) => {
        textarea.required = requireText;
      });
      await prefs.setPref('requireText', requireText);
    },
    async imageFormSubmit (e) {
      e.preventDefault();
      const formObj = serialize(this, {hash: true});
      await updateViews('form', formObj);
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
  editMode: await prefs.getPref('editMode'),
  behaviors: {
    async setEditMode (e) {
      const editMode = e.target.value;
      await prefs.setPref('editMode', editMode);
      ImageMaps.setImageMaps({
        formObj: JSON.parse($('#serializedJSON').value),
        editMode,
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
    },
    async serializedHTMLInput () {
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
      await updateViews('html', formObj, this);
    },
    async serializedJSONInput () {
      let formObj;
      try {
        formObj = JSON.parse(this.value);
      } catch (err) {
        this.setCustomValidity(_('JSON Did not parse', err));
        this.reportValidity();
        return;
      }
      this.setCustomValidity('');

      await updateViews('json', formObj, this);
    },
    async rectClick (e) {
      e.preventDefault();
      await ImageMaps.addRect({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    },
    async circleClick (e) {
      e.preventDefault();
      await ImageMaps.addCircle({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    },
    async removeClick (e) {
      e.preventDefault();
      await ImageMaps.removeShape({
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
    },
    async removeAllClick (e) {
      e.preventDefault();
      await ImageMaps.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    }
  }
});

addImageRegion(imgRegionID++);

body.addEventListener('keydown', (e) => {
  if (!e.repeat && e.key === 'f' && (e.metaKey || e.ctrlKey)) {
    // console.log('Find');
    // Add magnifying glass next to control (and type=search for
    //   clear-results button?)
    // Left-facing:
    // '\u{1F50D}' (or if necessary as surrogates: '\uD83D\uDD0D')
    // Or for right-facing:
    // '\u{1F50E}' (or if necessary as surrogates: '\uD83D\uDD0E')
    e.preventDefault();
  }
});
})();
