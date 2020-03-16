/* eslint-disable jsdoc/require-jsdoc */
import {jml, $, $$, body} from './node_modules/jamilih/dist/jml-es.js';
import {
  serialize, deserialize
} from './node_modules/form-serialization/dist/index-es.js';

import tippy from './external/tippy.js/dist/tippy.esm.js';
// Todo: Switch to npm version
import _ from './external/i18n/i18n.js';
import {empty, timeout} from './external/dom-behaviors/dom-behaviors.js';

import * as Views from './views/index/view-index.js';
import * as Styles from './styles/styles-index.js';
import * as ImageMaps from './behaviors/jqueryImageMaps.js';
import * as TextSearch from './behaviors/mapTextSearch.js';
import {
  enableTextDragRectangle, disableTextDragRectangle
} from './behaviors/copyTextDragRectangle.js';

import {SimplePrefs} from './node_modules/simple-prefs/dist/index.esm.js';

// Todo: Could allow for multiple image maps
const mapID = 0;

const prefs = new SimplePrefs({namespace: 'maptext-', defaults: {
  lastMapName: `map${mapID}`,
  lastImageSrc: 'sample-image-texts/Handwriting_of_Shoghi_Effendi_1919-1.jpg',
  requireText: true,
  editMode: 'edit'
}});

async function setTextRectangleByEditMode () {
  const editMode = await prefs.getPref('editMode');
  if (editMode !== 'edit') {
    enableTextDragRectangle(ImageMaps.getPosition(), editMode);
  } else {
    disableTextDragRectangle();
  }
}

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
  const clonedImagePreview = $('#imagePreview').cloneNode(true);
  clonedImagePreview.querySelector('svg').remove();
  $('#serializedHTML').value =
    clonedImagePreview.outerHTML;
}

function getSerializedJSON () {
  return JSON.parse($('#serializedJSON').value);
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
    // Don't actually set the map and update
    if (type !== 'map') {
      await formToPreview(formObj); // Sets preview
    }
    // Even for map, we must update apparently because change in form
    //   control positions after adding controls changes positions within
    //   map as well
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
  await Promise.all(
    imageMapFormObjectInfo(formObj).map(({shape, alt, coords}) => {
      return ImageMaps.addShape(shape, {coords});
    })
  );
  const editMode = await prefs.getPref('editMode');
  ImageMaps.showGuidesUnlessViewMode(editMode);
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
  const defaultImageSrc = await prefs.getPref('lastImageSrc');
  const imagePreview = $('#imagePreview');
  const {name} = formObj;
  imagePreview.replaceWith(
    Views.imagePreview({
      name,
      src: $('input[name=mapURL]').value || (
        defaultImageSrc.startsWith('http')
          ? defaultImageSrc
          : location.href + '/' + defaultImageSrc
      )
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

  // Todo: Only build a new area if not one for the same coords already
  //   (in which case, supplement it with `alt` and `mouseover`)
  const map = $(`map[name=${name}]`);
  function mouseover () {
    this.dataset.tippyContent = this.alt;
    tippy('[data-tippy-content]', {
      followCursor: true,
      distance: 10,
      placement: 'right'
    });
  }

  await setTextRectangleByEditMode();

  // Todo: Should find a better way around this
  // Wait until SVG is built
  await timeout(500);
  imageMapFormObjectInfo(formObj).map(({shape, alt, coords}) => {
    return {shape, alt, coords: coords.join(',')};
  }).filter(({shape, alt, coords}) => {
    const existingArea = map.querySelector(
      `area[shape="${shape}"][coords="${coords}"]`
    );
    if (existingArea) {
      existingArea.alt = alt || '';
      existingArea.addEventListener('mouseover', mouseover);
    }
    return !existingArea;
  }).forEach(({shape, alt, coords}) => {
    jml(...Views.buildArea({
      shape,
      alt,
      coords,
      behaviors: {mouseover}
    }), map);
  });
}

document.title = Views.title();

let requireText;
(async () => {
await Styles.load();

requireText = await prefs.getPref('requireText');

async function getMapData ({url, method}) {
  const response = await fetch(url, {method});
  return response.json();
}

function mapDataByName ({name, method = 'GET'}) {
  return getMapData({
    method,
    url: '/maps/' + encodeURIComponent(name)
  });
}

function rememberLastMap (map) {
  return Promise.all([
    prefs.setPref('lastMapName', map.name),
    prefs.setPref('lastImageSrc', map.mapURL)
  ]);
}

async function mapNameChange (e, avoidSetting) {
  if (!this.value) {
    updateSerializedJSON({});
    serializedJSONInput.call($('#serializedJSON'));
    return;
  }
  form.disabled = true;
  const map = await mapDataByName({name: this.value});
  // eslint-disable-next-line no-console
  console.log('maps', map);
  if (map.name) {
    await ImageMaps.removeAllShapes({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
    updateSerializedJSON(map);
    serializedJSONInput.call($('#serializedJSON'));
    await rememberLastMap(map);
  }
  form.disabled = false;
}

async function saveMapData ({url, method, data}) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

form = Views.mainForm({
  defaultMapName: await prefs.getPref('lastMapName'),
  defaultImageSrc: await prefs.getPref('lastImageSrc'),
  initialPrefs: {requireText},
  behaviors: {
    async mapDelete (e) {
      e.preventDefault();
      const mapName = $('input[name="name"]').value;
      if (!mapName) {
        // eslint-disable-next-line no-alert
        alert(_('You must provide a map name'));
        return;
      }
      // eslint-disable-next-line no-alert
      const ok = confirm(
        _(`Are you sure you wish to delete the map: ${mapName} ?`)
      );
      if (!ok) {
        return;
      }
      const results = await mapDataByName({
        name: mapName, method: 'DELETE'
      });
      console.log('delete results', results);
      await ImageMaps.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
      await rememberLastMap({
        name: null,
        mapURL: null
      });

      // eslint-disable-next-line no-alert
      alert(_('Map deleted!'));
    },
    mapNameChange,
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
      const mapName = $('input[name="name"]').value;
      if (!mapName) {
        // eslint-disable-next-line no-alert
        alert(_('You must provide a map name'));
        return;
      }
      const map = await mapDataByName({name: mapName});
      if (map.name) {
        // eslint-disable-next-line no-alert
        const ok = confirm(
          _(`Do you wish to overwrite the existing map: ${mapName}?`)
        );
        if (!ok) {
          return;
        }
      }

      const cfg = map.name
        // Overwrite
        ? {
          url: '/maps/' + encodeURIComponent(mapName),
          method: 'PUT'
        }
        // Create new
        : {
          url: '/maps',
          method: 'POST'
        };

      await saveMapData({...cfg, data: formObj});
      await updateViews('form', formObj);
      await rememberLastMap(formObj);

      // eslint-disable-next-line no-alert
      alert(map.name ? _('Map overwritten!') : _('Map created!'));
    },
    submitFormClick () {
      // To try again, we reset invalid forms, e.g., from previous bad JSON
      [...form.elements].forEach((ctrl) => {
        ctrl.setCustomValidity('');
      });
    }
  }
});

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

      await setTextRectangleByEditMode();

      $('input.zoom').disabled = editMode === 'edit';
      $('a.zoom').hidden = editMode === 'edit';

      const {width, height, shapes} = ImageMaps.getPreviewInfo();
      if (!width || !height) { // Nothing else to do yet
        return;
      }
      // console.log('width', width, height, shapes, editMode);

      await formToPreview(getSerializedJSON());
      /*
      ImageMaps.setImageMaps({
        formObj: getSerializedJSON(),
        editMode,
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
      */

      ImageMaps.copyImageMapsToPreview({width, height, shapes});

      ImageMaps.showGuidesUnlessViewMode(editMode);
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
    serializedJSONInput,
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
    },
    zoomClick (e) {
      e.preventDefault();

      const zoomInput = $('input.zoom');
      const val = Number(zoomInput.value || 100);

      if (typeof val !== 'number' || isNaN(val) || val <= 0) {
        alert( // eslint-disable-line no-alert
          _('You must enter a number and one greater than 0.')
        );
        return;
      }

      ImageMaps.zoomPreviewAndResize(val);
    }
  }
});

addImageRegion(imgRegionID++);

await mapNameChange.call($('input[name="name"]'), true);

Views.findBar({
  // Left-facing:
  // '\u{1F50D}' (or if necessary as surrogates: '\uD83D\uDD0D')
  // Or for right-facing:
  // '\u{1F50E}' (or if necessary as surrogates: '\uD83D\uDD0E')
  magnifyingGlassText: '\u{1F50D}',
  behaviors: {
    async input () {
      const {value} = this;
      const formObj = getSerializedJSON();

      // Todo: Allow `all` mode
      // Todo: Even for "first" mode, we need to get "next"
      const mode = 'first';
      const isFirstMode = mode === 'first';

      const formObjectInfo = imageMapFormObjectInfo(formObj);
      const [
        beginSegmentIndexIndex, endSegmentIndexIndex
      ] = TextSearch.getBeginAndEndIndexes({
        formObjectInfo, value, isFirstMode
      });

      const viewMode = (await prefs.getPref('editMode')) === 'view';

      async function blinkShape ({shape, coords}) {
        let attSel;
        switch (shape) {
        default:
          throw new Error('Unexpected shape ' + shape);
        case 'rect': {
          const [x, y, x2, y2] = coords;
          const width = x2 - x;
          const height = y2 - y;
          attSel = `[x="${x}"][y="${y}"][width="${width}"][height="${height}"]`;
          break;
        }
        case 'circle': {
          const [cx, cy, r] = coords;
          attSel = `[cx="${cx}"][cy="${cy}"][r="${r}"]`;
          break;
        }
        case 'polygon': {
          attSel = `[points=${coords.join(',')}]`;
        }
        }
        const matchedShape = $(shape + attSel);
        console.log('mat', shape + attSel, matchedShape);
        matchedShape.classList.add('borderBlink');
        await timeout(3000);
        matchedShape.classList.remove('borderBlink');
        /*
        // Gets correct <area>, but doesn't work to style apparently
        const matchedArea = $(`area[coords="${coords.join(',')}"]`);
        console.log('matchedArea', matchedArea);
        matchedArea.classList.add('borderBlink');
        await timeout(10000);
        matchedArea.classList.remove('borderBlink');
        */
      }

      formObjectInfo.slice(
        beginSegmentIndexIndex, endSegmentIndexIndex + 1
      ).forEach(async (
        {shape, coords}
      ) => {
        // Todo: Highlight
        // console.log('matching shape & coords', shape, coords);
        if (viewMode) {
          // We don't have displayed shapes now (with accurate dimensions),
          //  so we have to build our own elements
          ImageMaps.addShape(shape, {coords});
          await timeout(500);
        }
        blinkShape({shape, coords});
        if (viewMode) {
          await timeout(2000);
          ImageMaps.removeShape();
        }
      });
    },
    cancel () {
      $('.findBar').style.display = 'none';
    }
  }
});

body.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('.findBar').style.display = 'none';
    return;
  }
  if (!e.repeat && e.key === 'f' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    $('.findBar').style.display = 'block';
  }
});
})();
