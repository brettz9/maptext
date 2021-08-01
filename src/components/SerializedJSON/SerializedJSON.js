import _ from '../../../external/i18n/i18n.js';
import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

/**
 *
 */
class SerializedJSON extends HyperHTMLElement {
  static get observedAttributes () { return ['form-id']; }

  /**
   * @param {FormObject} formObj
   * @returns {void}
   */
  updateSerializedJSON (formObj) {
    this.querySelector('#serializedJSON').value =
      JSON.stringify(formObj, null, 2);
  }

  /**
   * @returns {void}
   */
  serializedJSONInput () {
    let formObj;
    const textarea = this.querySelector('textarea');
    try {
      formObj = JSON.parse(textarea.value);
    } catch (err) {
      textarea.setCustomValidity(_('JSON Did not parse', err));
      textarea.reportValidity();
      return;
    }
    textarea.setCustomValidity('');

    this.dispatchEvent(new CustomEvent('form-view-update', {
      bubbles: true,
      detail: {
        type: 'json',
        formObj,
        formControl: textarea
      }
    }));
  }

  /**
   * @returns {FormObject}
   */
  getJSON () {
    return JSON.parse(this.querySelector('textarea').value);
  }

  render () {
    return this.html`<section class="serialized">
      <h2>${_('Serialized JSON')}</h2>
      <textarea
        id="serializedJSON"
        form=${this.formId}
        'aria-label'=${_('Serialized JSON')}
        oninput=${this.serializedJSONInput}
      >
      </textarea>
    </section>`;
  }
}

SerializedJSON.define('serialized-json');

export default SerializedJSON;
