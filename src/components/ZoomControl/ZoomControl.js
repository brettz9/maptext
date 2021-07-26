import {nbsp} from '../../../external/jamilih/dist/jml-es.js';
import _ from '../../../external/i18n/i18n.js';

import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

/**
 *
 */
class ZoomControl extends HyperHTMLElement {
  /**
   * @returns {string[]}
   */
  static get booleanAttributes () { return ['disabled']; }

  /**
   * @returns {string[]}
   */
  static get observedAttributes () { return ['value']; }

  static formAssociated = true;

  /**
  * @returns {void}
  */
  created () {
    this.internals_ = this.attachInternals();
    this.value_ = '';
    this.render();
  }

  /* eslint-disable jsdoc/require-jsdoc -- Form boilerplate */
  get value () { return this.value_; }
  set value (v) { this.value_ = v; }
  get form () { return this.internals_.form; }
  get name () { return this.getAttribute('name'); }
  get type () { return this.localName; }
  get validity () { return this.internals_.validity; }
  get validationMessage () { return this.internals_.validationMessage; }
  get willValidate () { return this.internals_.willValidate; }

  checkValidity () { return this.internals_.checkValidity(); }
  reportValidity () { return this.internals_.reportValidity(); }
  /* eslint-enable jsdoc/require-jsdoc -- Form boilerplate */

  /**
  * @param {Event} e
  * @returns {void}
  */
  handleClick (e) {
    e.preventDefault();
    e.stopPropagation();

    const zoomInput = this.querySelector('input.zoom');
    const val = Number(zoomInput.value || 100);

    if (!this.matches(':disabled')) {
      if (typeof val !== 'number' || Number.isNaN(val)) {
        this.internals_.setValidity(
          {
            customError: true
          },
          _('You must enter a number.')
        );
        this.focus();
        this.reportValidity();
        return;
      }
      if (val <= 0) {
        console.log('111', val);
        this.internals_.setValidity(
          {
            customError: true,
            rangeUnderflow: true
          },
          _('You must enter a number greater than 0.')
        );
        this.focus();
        this.reportValidity();
        return;
      }
    }
    this.dispatchEvent(new Event('click', {
      bubbles: true
    }));
  }

  /**
  * @returns {void}
  */
  disable () {
    this.disabled = true;
  }

  /**
  * @returns {void}
  */
  enable () {
    this.disabled = false;
  }

  /**
  * @returns {void}
  */
  handleChange () {
    this.internals_.setFormValue(this.value_);
  }

  /**
   * @returns {HTMLFieldsetElement}
   */
  render () {
    return this.html`<fieldset class="zoom">
      <legend>${_('Zoom')}</legend>
      <input
        type="number"
        class="zoom"
        disabled=${this.disabled}
        onchange=${this.handleChange}
        aria-label=${_('zoom')}
        placeholder=${_('zoom percentage')}
      />
      ${nbsp}
      <a
        href="#"
        hidden=${this.disabled}
        class="zoom btn"
        onclick=${this.handleClick}
      >
        ${_('zoom')}
      </a>
    </fieldset>`;
  }
}

ZoomControl.define('zoom-control');

export default ZoomControl;
