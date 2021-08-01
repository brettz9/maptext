import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';
import _ from '../../../external/i18n/i18n.js';

/**
 *
 */
class SerializedHTML extends HyperHTMLElement {
  static get observedAttributes () { return ['form-id']; }

  /**
  * @returns {void}
  */
  serializedHTMLInput () {
    const textarea = this.querySelector('textarea');
    const html = new DOMParser().parseFromString(textarea.value, 'text/html');
    const map = html.querySelector('map[name]');
    const img = html.querySelector(
      `img[usemap="#${map.name}"][src]`
    );
    const areas = [...map.querySelectorAll('area')];
    if (!map || !areas.length || !img) {
      textarea.setCustomValidity(!map
        ? _('Missing <map name=> element ')
        : (!areas.length)
          ? _('Missing <area>')
          : _('Missing matching <img usemap= src=>'));
      textarea.reportValidity();
      return;
    }
    textarea.setCustomValidity('');

    const formObj = {
      name: map.name,
      mapURL: img.src
    };
    areas.forEach(({shape, coords, alt}, index) => {
      if (!shape || !coords) {
        return;
      }
      coords = coords.split(/,\s*/u);
      setFormObjCoords({index, shape, coords, text: alt || '', formObj});
    });
    // alert(JSON.stringify(formObj, null, 2));
    this.dispatchEvent(new CustomEvent('form-view-update', {
      bubbles: true,
      detail: {
        type: 'html',
        formObj,
        formControl: textarea
      }
    }));
  }

  render () {
    return this.html`<section class="serialized">
      <h2>${_('Serialized HTML')}</h2>
      <textarea
        id="serializedHTML"
        form=${this.formId}
        'aria-label'=${_('Serialized HTML')}
        oninput=${this.serializedHTMLInput}
      />
    </section>`;
  }
}

SerializedHTML.define('serialized-html');

export default SerializedHTML;
