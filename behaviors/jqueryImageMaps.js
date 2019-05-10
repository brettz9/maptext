/* globals jQuery */
/* eslint-disable require-jsdoc */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import jqueryImageMaps from '../node_modules/imagemaps/dist/index.esm.js';
import {timeout} from '../external/dom-behaviors/dom-behaviors.js';

const $ = jqueryImageMaps(jQuery);

const mockFormForValidation = {
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
};

let _shapeStrokeFillOptions, _formObj;

export const setFormObj = (formObj) => {
  _formObj = formObj;
};

export function setShapeStrokeFillOptions (shapeStrokeFillOptions) {
  _shapeStrokeFillOptions = shapeStrokeFillOptions;
}

export async function addShape (shape, {sharedBehaviors, coords}) {
  // Not sure why the timeout is necessary, but without it,
  //   the shape that is set is regularly hidden (especially
  //   when following `removeAllShapes`?)
  await timeout(200);
  $('#preview').setShapeStyle(
    _shapeStrokeFillOptions
  ).addShape(
    coords, $('input[name=mapURL]')[0].value, shape
  );
  if (sharedBehaviors) {
    const newIndex = parseInt(
      $('#preview').imageMaps().shapeEl.data('index')
    );
    await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
      index: newIndex,
      shape,
      coords,
      text: '',
      formObj: _formObj,
      formControl: mockFormForValidation
    });
  }
}
export function addRect ({
  sharedBehaviors,
  coords = [10, 20, 300, 300]
}) {
  return addShape('rect', {sharedBehaviors, coords});
}
export function addCircle ({
  sharedBehaviors,
  coords = [100, 100, 50]
}) {
  return addShape('circle', {sharedBehaviors, coords});
}
export async function removeAllShapes ({sharedBehaviors} = {}) {
  try {
    $('#preview').removeAllShapes();
    setFormObj({
      name: _formObj.name,
      mapURL: _formObj.mapURL
    });
  } catch (err) {
    // May not yet be present
  }

  if (sharedBehaviors) {
    // Reset to default empty rect shape
    await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
      index: 0,
      shape: 'rect',
      coords: ['', '', '', ''],
      text: '',
      formObj: _formObj || {},
      formControl: mockFormForValidation,
      removeAll: true
    });
  }
}
export async function removeShape ({sharedBehaviors} = {}) {
  const imageMaps = $('#preview').imageMaps();
  if (imageMaps.svgEl.find('._shape_face').length <= 1) {
    // Follow this routine instead which will at least set
    //   a single empty rect set rather than removing the form
    await removeAllShapes({sharedBehaviors});
    return;
  }

  const oldIndex = parseInt(
    imageMaps.shapeEl.data('index')
  );
  const {
    type: oldShapeToDelete
  } = $('#preview').imageMaps().getShapeInfo(oldIndex);

  $('#preview').removeShape();
  if (sharedBehaviors) {
    await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
      index: oldIndex,
      shape: undefined,
      oldShapeToDelete,
      coords: [],
      text: undefined,
      formObj: _formObj,
      formControl: mockFormForValidation
    });
  }
}

export function setImageMaps ({formObj, editMode, sharedBehaviors}) {
  setFormObj(formObj);
  const settings = {
    isEditMode: editMode === 'edit',
    shape: 'rect',
    shapeStyle: _shapeStrokeFillOptions,
    onClick (e, targetAreaHref) {
      // eslint-disable-next-line no-console
      console.log('click-targetAreaHref', targetAreaHref);
    },
    // onMouseDown (e, shapeType, coords) {},
    // We could use this but probably too aggressive
    // onMouseMove (e, shapeType, movedCoords) {},
    async onMouseUp ({target: {dataset: {index}}}, shapeType, updatedCoords) {
      const {type: shape} = this.getShapeInfo(index);

      // Won't change shape (and we don't change text here),
      //   so we only worry about coords (and only for the moved
      //   element)
      // eslint-disable-next-line no-console
      console.log('updatedCoords', updatedCoords);

      await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index,
        shape,
        coords: updatedCoords,
        text: formObj[index + '_text'] || '',
        formObj,
        formControl: mockFormForValidation
      });
    },
    onSelect (e, data) {
      console.log(data); // eslint-disable-line no-console
    }
  };

  $('#preview').imageMaps(settings);
  // $('#preview')[editMode === 'edit' ? 'show' : 'hide']();

  showGuidesUnlessViewMode(editMode);
}

export function getPreviewInfo () {
  const previewElement = $('#preview');
  const width = previewElement.width();
  const height = previewElement.height();
  const shapes = previewElement.getAllShapes();
  return {width, height, shapes};
}

// See https://github.com/naver/image-maps/pull/15
/**
* @typedef {PlainObject} SourceInfo
* @property {external:imageMaps.AllShapeInfo} shapes
* @property {Float} width
* @property {Float} height
*/
/**
 * @param {SourceInfo} sourceInfo
 * @param {external:jQuery} targetEl
 * @returns {void}
 */
function copyImageMaps ({shapes, width, height}, targetEl) {
  targetEl.removeAllShapes();
  $.each(shapes, (index, item) => {
    targetEl.setShapeStyle(item.style);
    if (item.href) {
      targetEl.setImageShape(item.href);
    }
    if (item.text) {
      targetEl.setTextShape(item.text);
    }
    const widthRatio = width;
    const heightRatio = height;
    const newCoords = targetEl.getCoordsByRatio(
      item.coords,
      item.type,
      targetEl.width() / widthRatio,
      targetEl.height() / heightRatio
    );
    /*
    console.log(
      'widthRatio', widthRatio, heightRatio,
        newCoords, targetEl.width(), targetEl.height()
    );
    */
    targetEl.addShape(newCoords, item.url, item.type);
  });
}

export function copyImageMapsToPreview (sourceInfo) {
  copyImageMaps(sourceInfo, $('#preview'));
}
export function showGuidesUnlessViewMode (editMode) {
  $('map[name=map0] > svg').css(
    'visibility',
    editMode !== 'view' ? 'visible' : 'hidden'
  );
}

export function zoomPreviewAndResize (val) {
  const preview = $('#preview');
  preview.zoom([val]);

  // for image resize
  $('#imagePreview').css({
    width: val * 0.01 * preview.width(),
    height: val * 0.01 * preview.height()
  });
}

export function getPosition () {
  return $('#preview').position();
}

let originalPreviewWidth;
let originalPreviewHeight;
export function getZoom () {
  const preview = $('#preview');
  if (originalPreviewWidth === undefined) {
    originalPreviewWidth = preview.width();
    originalPreviewHeight = preview.height();
  }
  const xZoom = preview.width() / originalPreviewWidth;
  const yZoom = preview.height() / originalPreviewHeight;
  return [xZoom, yZoom];
}
