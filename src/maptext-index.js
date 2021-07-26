import {$, $$} from '../external/query-dollar/dollar.js';
import {deserialize} from '../external/form-serialization/dist/index-es.js';
// Todo: Switch to npm version
import _ from '../external/i18n/i18n.js';
import {empty} from '../external/dom-behaviors/dom-behaviors.js';
import {SimplePrefs} from '../external/simple-prefs/dist/index.esm.js';
import getStyles from '../external/get-styles/getStyles.js';

import imageMapFormObjectInfo from
  './components/TextImageMap/imageMapFormObjectInfo.js';
import getFormToImageMap from './behaviors/getFormToImageMap.js';

import findImageRegionBar from './model-views/findImageRegionBar.js';
import editPolyXY from './model-views/editPolyXY.js';
import formShapeSelection, {
  setImageRegionID, setRequireText
} from './model-views/formShapeSelection.js';
import mainForm from './model-views/mainForm.js';
import main from './model-views/main.js';

let editableFormToImageMap;
let requireText;
let form;

const styles = getStyles([
  'index.css'
]);

// Todo: Could allow for multiple image maps
const mapID = 0;

const prefs = new SimplePrefs({namespace: 'maptext-', defaults: {
  lastMapName: `map${mapID}`,
  lastImageSrc: 'sample-image-texts/Handwriting_of_Shoghi_Effendi_1919-1.jpg',
  requireText: true,
  mode: 'edit'
}});

/**
 * @param {boolean} removeAll
 * @returns {void}
 */
function updateSerializedHTML (removeAll) {
  if (removeAll) {
    $('#serializedHTML').value = '';
    return;
  }
  const clonedTextImageMap = $('.textImageMap').cloneNode(true);
  clonedTextImageMap.querySelector('svg').remove();
  $('#serializedHTML').value =
    clonedTextImageMap.outerHTML;
}

/**
 * @returns {string}
 */
function getSerializedJSON () {
  return JSON.parse($('#serializedJSON').value);
}

/**
 * @param {FormObject} formObj
 * @returns {void}
 */
function updateSerializedJSON (formObj) {
  $('#serializedJSON').value =
    JSON.stringify(formObj, null, 2);
}

/**
 * @param {FormObject} formObj
 * @returns {void}
 */
function deserializeForm (formObj) {
  const imageRegions = $('#imageRegions');
  empty(imageRegions);
  let highestID = -1;
  Object.entries(formObj).forEach(([key, shape]) => {
    if (!key.endsWith('_shape')) {
      return;
    }
    const currID = Number.parseInt(key.slice(0, -('_shape'.length)));
    formShapeSelection({
      requireText,
      prefs,
      imageRegionID: currID
    });
    const lastRegion = imageRegions.lastElementChild;
    const shapeSelector = lastRegion.querySelector('select');
    shapeSelector.name = key; // Number in key may differ
    shapeSelector.selectedIndex = ['rect', 'circle', 'poly'].indexOf(shape);
    shapeSelector.dispatchEvent(new Event('change'));
    if (shape === 'poly') {
      const polySetsStart = formObj[currID + '_xy'].length / 2;
      let polySets = polySetsStart;
      while (polySets > 2) { // Always have at least 2
        $('.polyDivHolder').append(
          editPolyXY(currID, polySets === polySetsStart)
        );
        polySets--;
      }
    }
    if (currID > highestID) {
      highestID = currID;
    }
  });
  setImageRegionID(highestID + 1);
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

/**
* @typedef {PlainObject<string, string>} FormObject
*/

// Todo: We could use OOP with polymorphic methods instead,
//   avoiding its own instance method
/**
 *
 * @param {"form"|"map"|"html"|"json"} type
 * @param {FormObject} formObj
 * @param {HTMLElement} [formControl] Control on which to report errors in
 *   form-building. Not needed if this is a change to the whole form.
 * @param {boolean} removeAll
 * @returns {void}
 */
async function updateViews (type, formObj, formControl, removeAll) {
  if (type !== 'form') {
    deserializeForm.call(formControl, formObj);
  }
  const textImageMap = $('text-image-map');
  if (!removeAll) {
    // Don't actually set the map and update
    if (type !== 'map') {
      await editableFormToImageMap({
        formObj,
        textImageMap: $('text-image-map')
      }); // Sets text image map
    }
    // Even for map, we must update apparently because change in form
    //   control positions after adding controls changes positions within
    //   map as well
    await updateMap(textImageMap, formObj);
  }
  if (type !== 'html') {
    updateSerializedHTML(removeAll);
  }
  if (type !== 'json') {
    updateSerializedJSON(removeAll ? {} : formObj);
  }
  textImageMap.setFormObject(formObj);
}

/**
 * @param {TextImageMap} textImageMap
 * @param {FormObject} formObj
 * @returns {Promise<void>}
 */
async function updateMap (textImageMap, formObj) {
  await textImageMap.removeAllShapes();
  await Promise.all(
    imageMapFormObjectInfo(formObj).map(({shape, alt, coords}) => {
      return textImageMap.addShape(shape, {coords});
    })
  );
  const mode = await prefs.getPref('mode');
  textImageMap.showGuidesUnlessViewMode(mode);
}

/**
* @param {FormObjectInfo} cfg
* @returns {void}
*/
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

  /**
   * @param {string} item
   * @param {Integer} i
   * @returns {void}
   */
  function circleOrRect (item, i) {
    if (coords[i] === undefined) {
      delete formObj[index + '_' + item];
    } else {
      formObj[index + '_' + item] = coords[i];
    }
  }
  switch (shape || oldShapeToDelete) {
  case 'circle':
    // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
    ['circlex', 'circley', 'circler'].forEach(circleOrRect);
    break;
  case 'rect':
    // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
    ['leftx', 'topy', 'rightx', 'bottomy'].forEach(circleOrRect);
    break;
  case 'poly':
    formObj[index + '_xy'] = coords;
    break;
  default:
  }
}

/**
* @typedef {PlainObject} FormObjectInfo
* @todo Complete
* @property {Integer} index
* @property {ImageDataShape} shape
* @property {Integer[]} coords
* @property {string} text
* @property {FormObject} formObj
* @property {ImageDataShape} oldShapeToDelete
*/

/**
* @typedef {FormObjectInfo} FormObjectEditInfo
* @property {HTMLElement} formControl
* @property {boolean} removeAll
*/

/**
 * @param {FormObjectInfo} cfg
 * @returns {Promise<void>}
*/
async function setFormObjCoordsAndUpdateViewForMap ({
  index, shape, coords, text, formObj, oldShapeToDelete,
  formControl, removeAll
}) {
  setFormObjCoords({index, shape, coords, text, formObj, oldShapeToDelete});
  await updateViews('map', formObj, formControl, removeAll);
}

/**
 * @returns {Promise<void>}
 */
async function requireTextBehavior () {
  requireText = this.checked;
  setRequireText(requireText);
  $$('.requireText').forEach((textarea) => {
    textarea.required = requireText;
  });
  await prefs.setPref('requireText', requireText);
}

/**
 * @param {PlainObject} cfg
 * @param {string} cfg.url
 * @param {"GET"|"DELETE"} cfg.method
 * @returns {JSON}
 */
async function fetchJSON ({url, method}) {
  const response = await fetch(url, {method});
  return response.json();
}

/**
* @param {PlainObject} cfg
* @param {string} cfg.name
* @param {"GET"|"DELETE"} [cfg.method="GET"]
* @returns {FormObject}
*/
function getMapDataByName ({name, method = 'GET'}) {
  return fetchJSON({
    method,
    url: '/maps/maps/' + encodeURIComponent(name)
  });
}

/**
* @typedef {GenericArray} LastPrefs
* @property {string} 0
* @property {string} 1
*/

/**
* @param {FormData} map
* @returns {Promise<LastPrefs>}
*/
function rememberLastMap (map) {
  return Promise.all([
    prefs.setPref('lastMapName', map.name),
    prefs.setPref('lastImageSrc', map.mapURL)
  ]);
}

/**
 * @returns {Promise<void>}
 */
async function serializedJSONInput () {
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
}

/**
 * @returns {Promise<void>}
 */
async function mapNameChange () {
  const textImageMap = $('text-image-map');
  if (!this.value) {
    updateSerializedJSON({});
    serializedJSONInput.call($('#serializedJSON'));
    return;
  }
  form.disabled = true;
  const map = await getMapDataByName({name: this.value});
  // eslint-disable-next-line no-console -- Debugging
  console.log('maps', map);
  if (map.name) {
    await textImageMap.removeAllShapes({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
    updateSerializedJSON(map);
    serializedJSONInput.call($('#serializedJSON'));
    await rememberLastMap(map);
  }
  form.disabled = false;
}

document.title = _('MapText demo');
// Todo: Detect locale and use https://github.com/brettz9/i18nizeElement
document.documentElement.lang = 'en-US';
document.documentElement.dir = 'ltr';

(async () => {
const [
  reqText,
  mode,
  lastMapName,
  lastImageSrc
] = await Promise.all([
  prefs.getPref('requireText'),
  prefs.getPref('mode'),
  prefs.getPref('lastMapName'),
  prefs.getPref('lastImageSrc'),
  styles.load()
]);

({editableFormToImageMap} = getFormToImageMap({
  prefs, styles, setFormObjCoordsAndUpdateViewForMap
}));

requireText = reqText;
setRequireText(requireText);

form = mainForm({
  defaultMapName: lastMapName,
  defaultImageSrc: lastImageSrc,
  initialPrefs: {requireText},
  updateViews, getMapDataByName, setFormObjCoordsAndUpdateViewForMap,
  rememberLastMap, requireTextBehavior, mapNameChange
});

main({
  form,
  prefs,
  mode,
  getSerializedJSON,
  editableFormToImageMap,
  setFormObjCoords,
  updateViews,
  serializedJSONInput,
  setFormObjCoordsAndUpdateViewForMap
});

formShapeSelection({prefs, requireText});

await mapNameChange.call($('input[name="name"]'));

findImageRegionBar({getSerializedJSON, prefs});
})();
