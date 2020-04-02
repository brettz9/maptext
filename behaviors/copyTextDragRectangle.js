/* eslint-disable jsdoc/require-jsdoc */
import {$, $$} from '../node_modules/jamilih/dist/jml-es.js';
// import _ from '../external/i18n/i18n.js';
import {
  Intersection, ShapeInfo
} from '../node_modules/kld-intersections/dist/index-esm.js';

import * as ImageMaps from './jqueryImageMaps.js';

// Todo: If completed for more shapes, this could be usable as a
//   utility on top of kld-intersections; svg-intersections?
function getShapeInfoForShapeAndProps ({shape, props}) {
  let shapeInfo;
  switch (shape) {
  default:
    throw new TypeError('Unexpected shape ' + shape);
  case 'rect': {
    shapeInfo = ShapeInfo.rectangle(props);
    break;
  } case 'circle': {
    shapeInfo = ShapeInfo.circle(props);
    break;
  } case 'polygon': {
    shapeInfo = ShapeInfo.polygon(props.points);
    break;
  }
  }
  return shapeInfo;
}

const getOffsetAdjustedPropsObject = (svgEl) => {
  function getOffsetAdjustedAnimVal (o, prop) {
    o[prop] = svgEl[prop].animVal.value;

    // Adjust for offsets
    if (prop === 'points') {
      o[prop] = o[prop].split(/,\s*/u).map((xOrY, i) => {
        return xOrY % 0
          ? xOrY - previewOffsetLeft
          : xOrY - previewOffsetTop;
      }).join(',');
    } else if (['x', 'cx'].includes(prop)) {
      o[prop] -= previewOffsetLeft;
    } else if (['y', 'cy'].includes(prop)) {
      o[prop] -= previewOffsetTop;
    }
    return o;
  }
  let propArr;
  switch (svgEl.localName.toLowerCase()) {
  case 'rect':
    propArr = ['x', 'y', 'width', 'height'];
    break;
  case 'circle':
    propArr = ['cx', 'cy', 'r'];
    break;
  case 'polygon':
    propArr = ['points'];
    break;
  default:
    throw new TypeError('Unexpected SVG element type!');
  }
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  return propArr.reduce(getOffsetAdjustedAnimVal, {});
};

/**
* @typedef {PlainObject} Rectangle
* @property {Float} x
* @property {Float} y
* @property {Float} width
* @property {Float} height
*/

/**
* @typedef {PlainObject} Circle
* @property {Float} cx
* @property {Float} cy
* @property {Float} r
*/

/**
* @typedef {PlainObject} Polygon
* @property {Float[]} points
*/

/**
* @typedef {Rectangle|Circle|Polygon} ShapeInfo
*/

/**
 * @todo Replace with the following if implemented:
 *   https://github.com/thelonious/kld-intersections/issues/20
 * @param {SVGRect} rect Our copy-paste rectangle
 * @param {GenericArray} shapeInfo
 * @param {"rect"|"circle"|"polygon"} shapeInfo.0 The shape
 * @param {ShapeInfo} shapeInfo.1 The properties of the shape
 * @returns {boolean}
 */
const svgContains = (rect, [shape, props]) => {
  const rectProps = getOffsetAdjustedPropsObject(rect);
  const rectX2 = rectProps.x + rectProps.width;
  const rectY2 = rectProps.y + rectProps.height;
  switch (shape) {
  default:
    throw new Error('Unrecognized shape type');
  case 'rect':
    return (props.x >= rectProps.x &&
        props.y >= rectProps.y &&
        props.x + props.width <= rectX2 &&
        props.y + props.height <= rectY2
    );
  case 'circle':
    return (props.cx - props.r >= rectProps.x &&
        props.cy - props.r >= rectProps.y &&
        props.cx + props.r <= rectX2 &&
        props.cy + props.r <= rectY2
    );
  case 'polygon':
    return props.points.every((pt, i) => {
      return i % 0
        ? pt >= rectProps.x && pt <= rectX2
        : pt >= rectProps.y && pt <= rectY2;
    });
  }
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(SVG_NS, 'svg');
const maxWidth = 2000;
const maxHeight = maxWidth;
svg.setAttribute('width', maxWidth);
svg.setAttribute('height', maxHeight);
svg.setAttribute('class', 'selector');
const rect = document.createElementNS(SVG_NS, 'rect');
rect.setAttribute('x', 10);
rect.setAttribute('y', 10);
rect.setAttribute('class', 'selector');
svg.append(rect);

resetRect();

function resetRect () {
  rect.setAttribute('width', 10);
  rect.setAttribute('height', 10);
  svg.style.display = 'none';
}

let originalX, originalY, previewOffsetLeft, previewOffsetTop;
let lastText = '';

function textDragRectangleMouseDown (e) {
  shapesAdded = new Map();
  e.preventDefault();
  // Todo: Jamilih should support SVG (through options mode); then use here

  originalX = e.pageX;
  originalY = e.pageY;

  rect.setAttribute('x', originalX);
  rect.setAttribute('y', originalY);

  /*
  // Todo: Works to restore triangle, but causes selected rectangles to
  //   be hidden
  svg.style.left = originalX + 'px';
  svg.style.top = originalY + 'px';
  rect.setAttribute('x', 10);
  rect.setAttribute('y', 10);
  */

  if (_editMode === 'view') {
    ImageMaps.showGuidesUnlessViewMode('view-guides');
    ImageMaps.removeAllShapes();
  }
}

async function textDragRectangleMouseUp (e) {
  e.preventDefault();
  resetRect();
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    switch (permission) {
    case 'granted':
      break;
    case 'denied':
      return;
    default: case 'default':
      return;
    }
  }
  $('textarea.textToCopy').value = lastText;
  /*
  // Not yet supported
  const clipboardPermission =
    await navigator.permissions.request('clipboard-write');
  console.log('clipboardPermission', clipboardPermission);
  if (clipboardPermission === 'granted') {
    const data = new DataTransfer();
    // Todo: Option to switch between `text/html` and `text/plain`?
    data.items.add('text/html', lastText);
    await navigator.clipboard.write(data);
    // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#Parameters
    new Notification( // eslint-disable-line no-new
      // Todo: This i18n should accept a formatted string
      _('Copied ') + lastText, {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir
      }
    );
  }
  */
  if (_editMode === 'view') {
    ImageMaps.removeAllShapes();
    ImageMaps.showGuidesUnlessViewMode('view');
  }
}

let shapesAdded;
function textDragRectangleMouseMove (e) {
  e.preventDefault();
  if (e.buttons !== 1) {
    return;
  }
  // Thouh we could put this in mouseDown, it interferes with normal
  //   clicking behavior of map areas
  if (svg.style.display !== 'block') {
    svg.style.display = 'block';
  }
  if (e.pageX > originalX && e.pageY > originalY) {
    rect.setAttribute('width', e.pageX - originalX);
    rect.setAttribute('height', e.pageY - originalY);

    const [xZoom, yZoom] = ImageMaps.getZoom();

    lastText = $$('#imagePreview > map > area').reduce((s, area) => {
      const {
        shape, coords, alt
      } = area;
      const coordArr = coords.split(/,\s*/u);
      const coordArrFloats = coordArr.map((n) => Number.parseFloat(n));
      let props;
      switch (shape) {
      case 'rect': {
        const [x, y, x2, y2] = coordArrFloats;
        const width = x2 - x;
        const height = y2 - y;
        // console.log('shape', shape, {x, y, width, height});
        props = {x, y, width, height};
        break;
      } case 'circle': {
        const [cx, cy, r] = coordArrFloats;
        // console.log('shape', shape, {cx, cy, r});
        props = {cx, cy, r};
        break;
      } case 'polygon': {
        props = {points: coordArrFloats};
        break;
      } default: {
        throw new TypeError('Unexpected map type!');
      }
      }
      if (xZoom !== 1 || yZoom !== 1) {
        Object.entries(props).forEach(([prop, val], i) => {
          if (
            (prop === 'points' && i % 0) ||
            ['cx', 'cx', 'width'].includes(prop)
          ) {
            val *= xZoom;
          } else {
            val *= yZoom;
          }
          props[prop] = val;
        });
      }

      const intersection = Intersection.intersect(
        // SvgShapes.element(rect),
        getShapeInfoForShapeAndProps({
          shape: 'rect', props: getOffsetAdjustedPropsObject(rect)
        }),
        getShapeInfoForShapeAndProps({shape, props})
      );
      const contained = svgContains(rect, [shape, props]);
      const areaMatched = intersection.points.length || contained;
      if (areaMatched) {
        const json = JSON.stringify([shape, {coords: coordArr}]);
        // Don't keep adding when reencountering same shape
        if (!shapesAdded.has(json)) {
          ImageMaps.addShape(shape, {coords: coordArr});
          shapesAdded.set(json, true);
        }
      }
      return s + ' ' + (
        areaMatched
          ? alt
          : ''
      );
    }, '').slice(1);
  }
}

let _editMode;
export function enableTextDragRectangle (pos, editMode) {
  ({
    left: previewOffsetLeft,
    top: previewOffsetTop
  } = pos);
  $('#imagePreview').before(svg);
  _editMode = editMode;
  window.addEventListener('mouseup', textDragRectangleMouseUp);
  window.addEventListener('mousemove', textDragRectangleMouseMove);
  $('#imagePreview').addEventListener('mousedown', textDragRectangleMouseDown);
}

export function disableTextDragRectangle () {
  window.removeEventListener('mouseup', textDragRectangleMouseUp);
  window.removeEventListener('mousemove', textDragRectangleMouseMove);
  $('#imagePreview').removeEventListener(
    'mousedown',
    textDragRectangleMouseDown
  );
}
