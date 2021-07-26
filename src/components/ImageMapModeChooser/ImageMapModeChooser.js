import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

import {$, nbsp} from '../../../external/jamilih/dist/jml-es.js';
import _ from '../../../external/i18n/i18n.js';

/**
*
*/
class ImageMapModeChooser extends HyperHTMLElement {
  /**
  * @returns {string[]}
  */
  static get observedAttributes () {
    return ['mode', 'text-image-map', 'readonly'];
  }
  // created () {
  // }

  /**
  * @param {Event} e
  * @returns {void}
  */
  handleClick (e) {
    const mode = e.target.value;

    const textImageMap = $(this.textImageMap);
    textImageMap.toggleTextDragRectangleByMode(mode);

    const {width, height, shapes} = textImageMap.getImageMapInfo();
    if (!width || !height) { // Nothing else to do yet
      return;
    }
    // console.log('width', width, height, shapes, mode);

    this.dispatchEvent(new CustomEvent('form-to-image-map', {
      bubbles: true,
      detail: {
        args: {
          mode,
          textImageMap
        },
        callback () {
          textImageMap.copyImageMapsToImageMap({width, height, shapes});
          textImageMap.showGuidesUnlessViewMode(mode);
        }
      }
    }));
  }

  /**
  * @returns {HTMLFieldsetElement}
  */
  render () {
    return this.html`<fieldset class="shapeControls">
      <legend>${this.readonly ? _('View mode?') : _('Edit mode?')}</legend>
      ${[
    ...(this.readonly ? [] : [['Edit', 'edit']]),
    ['View with guides', 'view-guides'],
    ['View', 'view']
  ].map(([i18nKey, mode]) => {
    return HyperHTMLElement.hyper`<label>
      <input
        name="mode"
        type="radio"
        onclick=${this.handleClick}
        checked=${this.mode === mode}
        value=${mode}
      />
      ${nbsp + _(i18nKey) + nbsp.repeat(3)}
      </label>
    `;
  })
}
    </fieldset>`;
  }
}

ImageMapModeChooser.define('image-map-mode-chooser');

export default ImageMapModeChooser;
