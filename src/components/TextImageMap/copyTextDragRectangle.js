import {$} from '../../../external/query-dollar/dollar.js';
// import _ from '../../external/i18n/i18n.js';
import {
  Intersection, ShapeInfo
} from '../../../external/kld-intersections/dist/index-esm.js';

// Todo: If completed for more shapes, this could be usable as a
//   utility on top of kld-intersections; svg-intersections?
/**
 * @param {PlainObject} cfg
 * @param {ImageDataShape} cfg.shape
 * @param {ShapeInfo} cfg.props
 * @throws {TypeError} Unexpected shape
 * @returns {external:KLDRectangle|external:KLDCircle|external:KLDPolygon}
 */
function getShapeInfoForShapeAndProps ({shape, props}) {
  let shapeInfo;
  switch (shape) {
  case 'rect': {
    // https://github.com/thelonious/kld-intersections/issues/65
    if (!('top' in props)) {
      props = {
        top: props.y, left: props.x, width: props.width, height: props.height
      };
    }
    shapeInfo = ShapeInfo.rectangle(props);
    break;
  } case 'circle': {
    shapeInfo = ShapeInfo.circle(props);
    break;
  } case 'polygon': {
    shapeInfo = ShapeInfo.polygon(props.points);
    break;
  }
  default:
    throw new TypeError('Unexpected shape ' + shape);
  }
  return shapeInfo;
}

/**
* @param {SVGRect} svgEl
* @throws {TypeError} Unexepcted element type
* @returns {Object<string, number>}
*/
function getOffsetAdjustedPropsObject (svgEl) {
  const getOffsetAdjustedAnimVal = (o, prop) => {
    o[prop] = svgEl[prop].animVal.value;

    // Adjust for offsets
    if (prop === 'points') {
      o[prop] = o[prop].split(/,\s*/u).map((xOrY, i) => {
        return xOrY % 0
          ? xOrY - this.imageMapOffsetLeft
          : xOrY - this.imageMapOffsetTop;
      }).join(',');
    } else if (['x', 'cx'].includes(prop)) {
      o[prop] -= this.imageMapOffsetLeft;
    } else if (['y', 'cy'].includes(prop)) {
      o[prop] -= this.imageMapOffsetTop;
    }
    return o;
  };
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
  // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
  return propArr.reduce(getOffsetAdjustedAnimVal, {});
}

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
 * @param {ImageDataShape} shapeInfo."0" The shape
 * @param {ShapeInfo} shapeInfo."1" The properties of the shape
 * @throws {Error}
 * @returns {boolean}
 */
function svgContains (rect, [shape, props]) {
  const rectProps = getOffsetAdjustedPropsObject.call(this, rect);
  const rectX2 = rectProps.x + rectProps.width;
  const rectY2 = rectProps.y + rectProps.height;
  switch (shape) {
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
  default:
    throw new Error('Unrecognized shape type');
  }
}

/**
 * @param {Event} e
 * @returns {void}
 */
function textDragRectangleMouseDown (e) {
  this.shapesAdded = new Map();
  e.preventDefault();
  // Todo: Jamilih should support SVG (through options mode); then use here

  this.originalX = e.pageX;
  this.originalY = e.pageY;

  this.rect.setAttribute('x', this.originalX);
  this.rect.setAttribute('y', this.originalY);

  /*
  // Todo: Works to restore triangle, but causes selected rectangles to
  //   be hidden
  svg.style.left = originalX + 'px';
  svg.style.top = originalY + 'px';
  rect.setAttribute('x', 10);
  rect.setAttribute('y', 10);
  */

  if (this._mode === 'view') {
    this.showGuidesUnlessViewMode('view-guides');
    this.removeAllShapes();
  }
}

/**
 * @param {Event} e
 * @returns {Promise<void>}
 */
async function textDragRectangleMouseUp (e) {
  e.preventDefault();
  this.resetRect();
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    switch (permission) {
    case 'granted':
      break;
    case 'denied':
      return;
    case 'default': default:
      return;
    }
  }
  $(this.copiedText).value = this.lastText;
  /*
  // Not yet supported
  const clipboardPermission =
    await navigator.permissions.request('clipboard-write');
  console.log('clipboardPermission', clipboardPermission);
  if (clipboardPermission === 'granted') {
    const data = new DataTransfer();
    // Todo: Option to switch between `text/html` and `text/plain`?
    data.items.add('text/html', this.lastText);
    await navigator.clipboard.write(data);
    // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#Parameters
    new Notification( // eslint-disable-line no-new
      // Todo: This i18n should accept a formatted string
      _('Copied ') + this.lastText, {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir
      }
    );
  }
  */
  if (this._mode === 'view') {
    this.removeAllShapes();
    this.showGuidesUnlessViewMode('view');
  }
}

/**
 * @param {Event} e
 * @returns {void}
 */
function textDragRectangleMouseMove (e) {
  e.preventDefault();
  if (e.buttons !== 1) {
    return;
  }
  // Though we could put this in mouseDown, it interferes with normal
  //   clicking behavior of map areas
  if (this.svg.style.display !== 'block') {
    this.svg.style.display = 'block';
  }
  if (e.pageX > this.originalX && e.pageY > this.originalY) {
    this.rect.setAttribute('width', e.pageX - this.originalX);
    this.rect.setAttribute('height', e.pageY - this.originalY);

    const [xZoom, yZoom] = this.getZoom();
    this.lastText = [
      ...this.querySelectorAll('.textImageMap > map > area')
    ].reduce((s, area) => {
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
          val *= (
            (prop === 'points' && i % 0) ||
            ['cx', 'cx', 'width'].includes(prop)
          )
            ? xZoom
            : yZoom;

          props[prop] = val;
        });
      }

      const userRectInfo = getShapeInfoForShapeAndProps({
        shape: 'rect',
        props: getOffsetAdjustedPropsObject.call(this, this.rect)
      });

      const areaMapInfo = getShapeInfoForShapeAndProps({shape, props});

      const intersection = Intersection.intersect(
        // SvgShapes.element(rect),
        userRectInfo,
        areaMapInfo
      );

      const areaMatched = intersection.points.length ||
        svgContains.call(this, this.rect, [shape, props]);
      if (areaMatched) {
        const json = JSON.stringify([shape, {coords: coordArr}]);
        // Don't keep adding when reencountering same shape
        if (!this.shapesAdded.has(json)) {
          this.addShape(shape, {coords: coordArr});
          this.shapesAdded.set(json, true);
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

const copyTextDragRectangle = {
  /**
   * Namespace the method as this is used as a mixin.
   * @returns {void}
   */
  init_copyTextDragRectangle () {
    this.setupSVG();
    this.resetRect();
    this.lastText = '';
  },
  setupSVG () {
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

    this.svg = svg;
    this.rect = rect;
  },
  resetRect () {
    this.rect.setAttribute('width', 10);
    this.rect.setAttribute('height', 10);
    this.svg.style.display = 'none';
  },

  enableTextDragRectangle ({pos, mode}) {
    const {left, top} = pos;
    this.imageMapOffsetLeft = left;
    this.imageMapOffsetTop = top;

    this.querySelector('.textImageMap').before(this.svg);

    this._mode = mode;

    this.mouseupListener = textDragRectangleMouseUp.bind(this);
    this.mousemoveListener = textDragRectangleMouseMove.bind(this);
    this.mousedownListener = textDragRectangleMouseDown.bind(this);

    window.addEventListener('mouseup', this.mouseupListener);
    window.addEventListener('mousemove', this.mousemoveListener);

    this.querySelector('.textImageMap').addEventListener(
      'mousedown', this.mousedownListener
    );
  },

  disableTextDragRectangle () {
    window.removeEventListener('mouseup', this.mouseupListener);
    window.removeEventListener('mousemove', this.mousemoveListener);

    this.querySelector('.textImageMap').removeEventListener(
      'mousedown',
      this.mousedownListener
    );
  },

  /**
   * @typedef {"edit"|"view-guides"|"view"} Mode
   */

  /**
   * @param {Mode} mode
   * @returns {void}
   */
  toggleTextDragRectangleByMode (mode) {
    if (mode === 'edit') {
      this.disableTextDragRectangle();
    } else {
      this.enableTextDragRectangle({
        pos: this.getPosition(),
        mode
      });
    }
  }
};

export default copyTextDragRectangle;
