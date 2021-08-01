import {jml, $, body} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';
import {deserialize} from '../../external/form-serialization/dist/index-es.js';
import {empty} from '../../external/dom-behaviors/dom-behaviors.js';
import getFormToImageMap from '../behaviors/getFormToImageMap.js';

import imageMapFormObjectInfo from
  '../components/TextImageMap/imageMapFormObjectInfo.js';
import '../components/TextImageMap/TextImageMap.js';
import '../components/CopiedText/CopiedText.js';
import '../components/ZoomControl/ZoomControl.js';
import '../components/ImageMapModeChooser/ImageMapModeChooser.js';
import '../components/TextImageMapForm/TextImageMapForm.js';
import '../components/SerializedJSON/SerializedJSON.js';
import '../components/SerializedHTML/SerializedHTML.js';

import '../view-components/FindImageRegionBar/FindImageRegionBar.js';

import textImageMapContainer from './textImageMapContainer.js';
import editPolyXY from './editPolyXY.js';
import formShapeSelection, {setImageRegionID} from './formShapeSelection.js';

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

const main = ({
  formID, prefs,
  mode, styles,
  behaviors,
  requireText
}) => {
  const {editableFormToImageMap} = getFormToImageMap({
    prefs, styles, setFormObjCoordsAndUpdateViewForMap
  });
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
   * @returns {void}
  */
  function setFormObjCoordsAndUpdateViewForMap ({
    index, shape, coords, text, formObj, oldShapeToDelete,
    formControl, removeAll
  }) {
    setFormObjCoords({index, shape, coords, text, formObj, oldShapeToDelete});
    this.dispatchEvent(new CustomEvent('form-view-update', {
      detail: {
        type: 'map',
        formObj,
        formControl,
        removeAll
      }
    }));
  }

  /**
   * @returns {void}
   */
  function formOnconnected () {
    this.customLoader = (async () => {
      const [
        lastMapName,
        lastImageSrc
      ] = await Promise.all([
        this.prefs.getPref('lastMapName'),
        this.prefs.getPref('lastImageSrc')
      ]);

      this.defaultMapName = lastMapName;
      this.defaultImageSrc = lastImageSrc;
    })();
  }

  /**
   * @todo Change to instance of `TextImageMap` component
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
    const newMode = await prefs.getPref('mode');
    textImageMap.showGuidesUnlessViewMode(newMode);
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
   * @typedef {PlainObject<string, string>} FormObject
   */

  /**
   * @param {PlainObject} cfg
   * @param {"form"|"map"|"html"|"json"} cfg.type
   * @param {FormObject} cfg.formObj
   * @param {HTMLElement} [cfg.formControl] Control on which to report errors in
   *   form-building. Not needed if this is a change to the whole form.
   * @param {boolean} cfg.removeAll
   * @returns {void}
   */
  async function updateViews ({type, formObj, formControl, removeAll}) {
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
      $('serialized-json').updateSerializedJSON(removeAll ? {} : formObj);
    }
    textImageMap.setFormObject(formObj);
  }

  return jml('div', {
    role: 'main' // For Axe tests (Accessbility)
  }, [
    ['div', {$on: {
      // Triggered by `text-image-map-form`, `serialized-html`, and
      //   `serialized-json`
      'form-view-update' ({detail}) {
        updateViews(detail);
      }
    }}, [
      ['h1', [_('MapText')]],
      ['text-image-map-form', {
        id: formID,
        $on: {
          'form-update' ({detail: updatedValue}) {
            $('serialized-json').updateSerializedJSON(updatedValue);
            $('serialized-json').serializedJSONInput();
          }
        },
        // Todo: Fix this
        onconnected: formOnconnected,
        // Could define more specific selector
        'text-image-map': 'text-image-map',
        'require-text': requireText
      }],
      ['serialized-html', {
        'form-id': formID
      }],
      ['serialized-json', {
        'form-id': formID
      }],
      textImageMapContainer({
        mode, prefs, editableFormToImageMap,
        setFormObjCoordsAndUpdateViewForMap
      })
    ]]
  ], body);
};

export default main;
