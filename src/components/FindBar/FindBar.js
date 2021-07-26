import _ from '../../../external/i18n/i18n.js';

import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';
import {nbsp, body} from '../../../external/jamilih/dist/jml-es.js';

// Left-facing:
// '\u{1F50D}' (or if necessary as surrogates: '\uD83D\uDD0D')
// Or for right-facing:
// '\u{1F50E}' (or if necessary as surrogates: '\uD83D\uDD0E')
const magnifyingGlassText = '\u{1F50D}';

/**
 *
 */
class FindBar extends HyperHTMLElement {
  /**
   * @returns {void}
   */
  /*
  created () {
    // this.shadowRoot = this.attachShadow({mode: 'open'}); // `this.shadowRoot`
    // this.shadowRoot.append();
    // this.addEventListener();
    // this.init_mixin1();
  }
  */

  /**
   * @returns {void}
   */
  created () {
    this.addEventListener('find-bar-cancel', () => {
      this.style.display = 'none';
    });

    body.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.style.display = 'none';
        return;
      }
      if (!e.repeat && e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.style.display = 'block';
        const findBar = this.querySelector('input.findBar');
        findBar.select();
        findBar.focus();
      }
    });

    this.render();
  }

  /**
  * @param {Event} e
  * @returns {void}
  */
  handleCancel (e) {
    this.dispatchEvent(new CustomEvent('find-bar-cancel', {
      bubbles: true,
      cancelable: true,
      // Triggers outside of shadowRoot
      composed: true
    }));
  }

  /**
   * @returns {HTMLDivElement}
   */
  render () {
    // type=search gives clear-results button
    return this.html`<div class="findBar">
      ${magnifyingGlassText}
      ${nbsp.repeat(2)}
      <input
        type="search"
        class="findBar"
        placeholder=${_('Search for text')}
      />
      ${nbsp}
      <button class="cancel" onclick=${this.handleCancel}>${_('x')}</button>
    </div>`;
  }
}

FindBar.define('find-bar'); // {extends: 'ul'}

export default FindBar;
