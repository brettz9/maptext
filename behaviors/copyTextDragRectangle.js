/* eslint-disable require-jsdoc */
import {$, $$} from '../node_modules/jamilih/dist/jml-es.js';
// import _ from '../external/i18n/i18n.js';
import {
  intersect, shape as intersectShape
} from '../node_modules/svg-intersections/dist/index-esm.js';

const svgShape = (svgEl) => {
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
  const props = propArr.reduce(getOffsetAdjustedAnimVal, {});

  console.log('props', svgEl.localName.toLowerCase(), props);
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
      console.log('[shape, props]', shape, props);
      const intersection = svgIntersect(rect, [shape, props]);
      console.log('intersection points', intersection.points);
      return s + ' ' + (
        intersection.points.length
          ? alt
          : ''
      );
    }, '').slice(1);
  }
}

export function enableTextDragRectangle () {
  previewOffsetLeft = $('#imagePreview').offsetLeft;
  previewOffsetTop = $('#imagePreview').offsetTop;
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
