/* eslint-disable require-jsdoc */
import {$, $$} from '../node_modules/jamilih/dist/jml-es.js';
// import _ from '../external/i18n/i18n.js';
import {
  intersect, shape as intersectShape
} from '../node_modules/svg-intersections/dist/index-esm.js';

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

const svgShape = (svgEl) => {
  const props = getOffsetAdjustedPropsObject(svgEl);
  return intersectShape(svgEl.localName.toLowerCase(), props);
};
const svgIntersect = (shape1, shape2) => {
  return intersect(
    Array.isArray(shape1)
      ? intersectShape(shape1[0], shape1[1])
      : svgShape(shape1),
    Array.isArray(shape2)
      ? intersectShape(shape2[0], shape2[1])
      : svgShape(shape2)
  );
};

/**
 * @todo Replace with the following if implemented:
 *   https://github.com/thelonious/kld-intersections/issues/20
 * @param {SVGRect} rect Our copy-paste rectangle
 * @param {Array} shapeInfo
 * @param {string} shapeInfo.0 The shape
 * @param {Object} shapeInfo.1 The properties of the shape
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
rect.setAttribute('x', 500);
rect.setAttribute('y', 500);
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
  e.preventDefault();
  // Todo: Jamilih should support SVG (through options mode); then use here

  originalX = e.pageX;
  originalY = e.pageY;
  rect.setAttribute('x', originalX);
  rect.setAttribute('y', originalY);
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
}

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

    lastText = $$('#imagePreview > map > area').reduce((s, {
      shape, coords, alt
    }) => {
      const coordArr = coords.split(/,\s*/u);
      let props;
      switch (shape) {
      case 'rect': {
        const [x, y, x2, y2] = coordArr.map((n) => parseFloat(n));
        const width = x2 - x;
        const height = y2 - y;
        // console.log('shape', shape, {x, y, width, height});
        props = {x, y, width, height};
        break;
      } case 'circle': {
        const [cx, cy, r] = coordArr.map((n) => parseFloat(n));
        // console.log('shape', shape, {cx, cy, r});
        props = {cx, cy, r};
        break;
      } case 'polygon': {
        props = {points: coords};
        break;
      } default: {
        throw new TypeError('Unexpected map type!');
      }
      }
      const intersection = svgIntersect(rect, [shape, props]);
      const contained = svgContains(rect, [shape, props]);
      return s + ' ' + (
        intersection.points.length || contained
          ? alt
          : ''
      );
    }, '').slice(1);
  }
}

export function enableTextDragRectangle (pos) {
  ({
    left: previewOffsetLeft,
    top: previewOffsetTop
  } = pos);
  $('#imagePreview').before(svg);
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
