import _ from '../../../external/i18n/i18n.js';
import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

import tippy from '../../../external/tippy.js/dist/tippy.esm.js';
import {jml} from '../../../external/jamilih/dist/jml-es.js';

import imageMapFormObjectInfo from './imageMapFormObjectInfo.js';
import jqueryImageMaps from './jqueryImageMaps.js';
import copyTextDragRectangle from './copyTextDragRectangle.js';

// Todo: Only build a new area if not one for the same coords already
//   (in which case, supplement it with `alt` and `mouseover`)
/**
 * @returns {void}
 */
function mouseover () {
  this.dataset.tippyContent = this.alt;
  tippy('[data-tippy-content]', {
    followCursor: true,
    distance: 10,
    placement: 'right'
  });
}

export const buildArea = ({shape, alt, coords}) => {
  const atts = {
    shape,
    coords,
    $on: {mouseover}
  };
  if (alt !== undefined) { // Todo: Make this a nullable type for Jamilih
    atts.alt = alt;
  }
  return ['area', atts];
};

/**
 *
 */
class TextImageMap extends HyperHTMLElement {
  /**
   * @returns {string[]}
   */
  static get observedAttributes () { return ['name', 'src', 'copiedText']; }

  /**
   * @returns {void}
   */
  created () {
    // this.shadowRoot = this.attachShadow({mode: 'open'}); // `this.shadowRoot`
    // this.shadowRoot.append();
    // this.addEventListener();
    this.init_copyTextDragRectangle();
  }

  /**
   * @returns {{name: string, src: string}}
   */
  get defaultState () {
    return {name: this.name, src: this.src};
  }

  /**
   * @param {string} name
   * @param {string} prev
   * @param {string} curr
   * @returns {void}
   */
  attributeChangedCallback (name, prev, curr) {
    this.setState({
      [name]: curr
    });

    if (this.name && this.src) {
      this.render();
    }
  }

  /**
  * @returns {void}
  */
  buildImageMapAreasForFormObject () {
    const map = this.querySelector(`map[name]`);
    imageMapFormObjectInfo(this._formObj).map(({shape, alt, coords}) => {
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
      jml(...buildArea({
        shape,
        alt,
        coords
      }), map);
    });
  }

  /**
   * @returns {HTMLDivElement}
   */
  render () {
    /*
      // Todo: To scale, we could add onload=${this}
      onload () => {
        this.naturalWidth, this.naturalHeight;
      }}
    */
    return this.html`<div class="textImageMap">
      <map name=${this.state.name} />
      <img
        class="textImageMap"
        alt=${_('Selected image for map')}
        usemap=${'#' + this.state.name}
        src=${this.state.src}
      />
    </div>`;
  }
}

// Mixin is for compartmentalization of jQuery, not based on unique features
Object.assign(TextImageMap.prototype, jqueryImageMaps, copyTextDragRectangle);

TextImageMap.define('text-image-map'); // {extends: 'ul'}

export default TextImageMap;
