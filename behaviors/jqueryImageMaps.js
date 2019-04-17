/* globals jQuery */
/* eslint-disable require-jsdoc */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import * as Styles from '../styles/index.js';
import jqueryImageMaps from '../node_modules/imagemaps/dist/index.esm.js';

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

export function setShapeStrokeFillOptions (shapeStrokeFillOptions) {
  _shapeStrokeFillOptions = shapeStrokeFillOptions;
}

export function addShape (shape, {sharedBehaviors, coords}) {
  // Not sure why the timeout is necessary, but without it,
  //   the shape that is set is regularly hidden (especially
  //   when following `removeAllShapes`?)
  setTimeout(() => {
    $('#preview').setShapeStyle(_shapeStrokeFillOptions).addShape(
      coords, $('input[name=mapURL]')[0].value, shape
    );
    if (sharedBehaviors) {
      const newIndex = parseInt(
        $('#preview').imageMaps().shapeEl.data('index')
      );
      sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index: newIndex,
        shape,
        coords,
        text: '',
        formObj: _formObj,
        formControl: mockFormForValidation
      });
    }
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
export function addEllipse ({
  sharedBehaviors,
  coords = [100, 100, 50, 50]
}) {
  return addShape('ellipse', {sharedBehaviors, coords});
}
export function removeAllShapes () {
  $('#preview').removeAllShapes();
}
export function removeShape () {
  $('#preview').removeShape();
}

export function setImageMaps ({formObj, sharedBehaviors}) {
  _formObj = formObj;
  $('#preview').imageMaps({
    isEditMode: true,
    shape: 'rect',
    shapeStyle: Styles.shapeStyle,
    onClick (e, targetAreaHref) {
      // eslint-disable-next-line no-console
      console.log('click-targetAreaHref', targetAreaHref);
    },
    // onMouseDown (e, shapeType, coords) {},
    // We could use this but probably too aggressive
    // onMouseMove (e, shapeType, movedCoords) {},
    onMouseUp ({target: {dataset: {index}}}, shapeType, updatedCoords) {
      const {type: shape} = this.getShapeInfo(index);

      // Won't change shape (and we don't change text here),
      //   so we only worry about coords (and only for the moved
      //   element)
      // eslint-disable-next-line no-console
      console.log('updatedCoords', updatedCoords);

      sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index,
        shape,
        coords: updatedCoords,
        text: formObj[index + '_text'],
        formObj,
        formControl: mockFormForValidation
      });
    },
    onSelect (e, data) {
      console.log(data); // eslint-disable-line no-console
    }
  });
}
