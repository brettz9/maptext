import _ from '../../external/i18n/i18n.js';

import HyperHTMLElement from '../../external/hyperhtml-element/esm/index.js';

import jqueryImageMaps from './jqueryImageMaps.js';
import copyTextDragRectangle from './copyTextDragRectangle.js';

/**
 *
 */
class ImagePreview extends HyperHTMLElement {
  /**
   * @returns {string[]}
   */
  static get observedAttributes () { return ['name', 'src']; }

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
   * @returns {HTMLDivElement}
   */
  render () {
    /*
      // Todo: To scale, we could add onload=${this}
      onload () => {
        this.naturalWidth, this.naturalHeight;
      }}
    */
    return this.html`<div class="imagePreview">
      <map name=${this.state.name} />
      <img
        class="preview"
        alt=${_('Selected image for map')}
        usemap=${'#' + this.state.name}
        src=${this.state.src}
      />
    </div>`;
  }
}

// Mixin is for compartmentalization of jQuery, not based on unique features
Object.assign(ImagePreview.prototype, jqueryImageMaps, copyTextDragRectangle);

ImagePreview.define('image-preview'); // {extends: 'ul'}

export default ImagePreview;
