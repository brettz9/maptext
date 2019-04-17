/* globals $ */
/* eslint-disable require-jsdoc */

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
      coords, $('#mapURL').val(), shape
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
