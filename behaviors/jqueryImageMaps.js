/* globals jQuery */
/* eslint-disable require-jsdoc */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import * as Styles from '../styles/index.js';
import jqueryImageMaps from '../node_modules/imagemaps/dist/index.esm.js';

const $ = jqueryImageMaps(jQuery);

let _shapeStrokeFillOptions;

export function setShapeStrokeFillOptions (shapeStrokeFillOptions) {
  _shapeStrokeFillOptions = shapeStrokeFillOptions;
}

export function setShape (shape, coords) {
  // Not sure why the timeout is necessary, but without it,
  //   the shape that is set is regularly hidden (especially
  //   when following `removeAllShapes`?)
  setTimeout(() => {
    $('#preview').setShapeStyle(_shapeStrokeFillOptions).addShape(
      coords, $('input[name=mapURL]')[0].value, shape
    );
  });
}
export function setRect (coords = [10, 20, 300, 300]) {
  return setShape('rect', coords);
}
export function setCircle (coords = [100, 100, 50]) {
  return setShape('circle', coords);
}
export function setEllipse (coords = [100, 100, 50, 50]) {
  return setShape('ellipse', coords);
}
export function removeAllShapes () {
  $('#preview').removeAllShapes();
}
export function removeShape () {
  $('#preview').removeShape();
}

export function setImageMaps ({formObj, sharedBehaviors}) {
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
    onMouseUp (e, shapeType, updatedCoords) {
      const targetEl = e.target;
      const {index} = targetEl.dataset;
      const {type: shape} = this.getShapeInfo(index);

      // Won't change shape (and we don't change text here),
      //   so we only worry about coords (and only for the moved
      //   element)
      // eslint-disable-next-line no-console
      console.log('updatedCoords', updatedCoords);

      sharedBehaviors.setFormObjCoords(formObj, shape, index, updatedCoords);

      sharedBehaviors.updateViews('map', formObj, {
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
