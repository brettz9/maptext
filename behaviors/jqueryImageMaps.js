/* globals jQuery */
/* eslint-disable require-jsdoc */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import jqueryImageMaps from '../node_modules/imagemaps/dist/index.esm.js';

const $ = jqueryImageMaps(jQuery);

// See https://github.com/naver/image-maps/pull/13
function copyImageMapsTo (sourceEl, targetEl) {
  const allShapes = sourceEl.getAllShapes();
  targetEl.removeAllShapes();
  $.each(allShapes, (index, item) => {
    targetEl.setShapeStyle(item.style);
    if (item.href) {
      targetEl.setImageShape(item.href);
    }
    if (item.text) {
      targetEl.setTextShape(item.text);
    }
    const widthRatio = sourceEl.width();
    const heightRatio = sourceEl.height();
    const newCoords = sourceEl.getCoordsByRatio(
      item.coords,
      item.type,
      targetEl.width() / widthRatio,
      targetEl.height() / heightRatio
    );
    targetEl.addShape(newCoords, item.url, item.type);
  });
}

function copyImageMaps () {
  // If https://github.com/naver/image-maps/pull/13
  //   is accepted, we can just do the following without
  //   the need for the above utility:
  // $('#preview').copyImageMapsTo($('#preview_noneditable'));
  copyImageMapsTo($('#preview'), $('#preview_noneditable'));
}

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

export function addShape (shape, {sharedBehaviors, coords}) {
  // Not sure why the timeout is necessary, but without it,
  //   the shape that is set is regularly hidden (especially
  //   when following `removeAllShapes`?)
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
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
      resolve();
    }, 200);
  });
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
  $('#preview').removeAllShapes();

  setFormObj({
    name: _formObj.name,
    mapURL: _formObj.mapURL
  });
  if (sharedBehaviors) {
    // Reset to default empty rect shape
    await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
      index: 0,
      shape: 'rect',
      coords: ['', '', '', ''],
      text: '',
      formObj: _formObj,
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

export function setImageMaps ({formObj, editMode, sharedBehaviors}) {
  setFormObj(formObj);
  const settings = {
    isEditMode: true,
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
  $('#preview_noneditable').imageMaps({
    ...settings, shapeStyle: _shapeStrokeFillOptions, isEditMode: false
  });

  $('#preview')[editMode === 'edit' ? 'show' : 'hide']();
  $('#preview_noneditable')[editMode !== 'edit' ? 'show' : 'hide']();

  // We need to show/hide the maps too or the guides will show
  $('map[name=map0]')[editMode === 'edit' ? 'show' : 'hide']();
  // eslint-disable-next-line standard/computed-property-even-spacing
  $('map[name=map0_noneditable_map]')[
    editMode === 'view-guides' ? 'show' : 'hide'
  ]();
  copyImageMaps();
}
