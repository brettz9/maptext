import _ from '../../../external/i18n/i18n.js';

import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

/**
 *
 */
class CopiedText extends HyperHTMLElement {
  /**
   * @returns {string}
   */
  get value () {
    return this.querySelector('textarea.copiedText').value;
  }

  /**
   * @param {string} val
   * @returns {void}
   */
  set value (val) {
    this.querySelector('textarea.copiedText').value = val;
  }

  /**
   * @returns {HTMLFieldsetElement}
   */
  render () {
    return this.html`<fieldset class="copiedText">
      <legend>${_('Copied text')}</legend>
      <textarea
        class="copiedText"
        aria-label=${_('Text to copy')}
        placeholder=${_('Text to copy')}
      />
    </fieldset>`;
  }
}

CopiedText.define('copied-text');

export default CopiedText;
