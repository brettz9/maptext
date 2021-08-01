import {nbsp} from '../../../external/jamilih/dist/jml-es.js';
import {$$} from '../../../external/query-dollar/dollar.js';
import _ from '../../../external/i18n/i18n.js';
import {serialize} from '../../../external/form-serialization/dist/index-es.js';
import HyperHTMLElement from '../../../external/hyperhtml-element/esm/index.js';

const nbsp2 = nbsp.repeat(2);

/**
 * @returns {Promise<void>}
 */
async function requireTextBehavior () {
  requireText = this.checked;
  setRequireText(requireText);
  $$('.requireText').forEach((textarea) => {
    textarea.required = requireText;
  });
  await prefs.setPref('requireText', requireText);
}

/**
 * @typedef {GenericArray} LastPrefs
 * @property {string} 0
 * @property {string} 1
 */

/**
 * @param {FormData} map
 * @returns {Promise<LastPrefs>}
 */
function rememberLastMap (map) {
  return Promise.all([
    prefs.setPref('lastMapName', map.name),
    prefs.setPref('lastImageSrc', map.mapURL)
  ]);
}

/**
 * @param {PlainObject} cfg
 * @param {string} cfg.url
 * @param {"GET"|"DELETE"} cfg.method
 * @returns {JSON}
 */
async function fetchJSON ({url, method}) {
  const response = await fetch(url, {method});
  return response.json();
}

/**
* @param {PlainObject} cfg
* @param {string} cfg.name
* @param {"GET"|"DELETE"} [cfg.method="GET"]
* @returns {FormObject}
*/
function getMapDataByName ({name, method = 'GET'}) {
  return fetchJSON({
    method,
    url: '/maps/maps/' + encodeURIComponent(name)
  });
}

/**
* @param {PlainObject} cfg
* @param {string} cfg.url
* @param {"PUT"|"POST"} cfg.method
* @param {FormObject} cfg.data
* @returns {JSON} Unused
*/
async function updateServerJSON ({url, method, data}) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 *
 */
class TextImageMapForm extends HyperHTMLElement {
  static get observedAttributes () {
    return [
      'text-image-map',
      'last-map-name',
      'last-image-src',
      'require-text'
    ];
  }

  /**
   * @returns {void}
   */
  submitFormClick () {
    // To try again, we reset invalid forms, e.g., from previous bad JSON
    [...this.querySelector('form').elements].forEach((ctrl) => {
      ctrl.setCustomValidity('');
    });
  }

  /**
   * @param {event} e
   * @returns {Promise<void>}
   */
  async mapDelete (e) {
    e.preventDefault();
    const mapName = this.querySelector('input[name="name"]').value;
    if (!mapName) {
      // eslint-disable-next-line no-alert -- Temporary
      alert(_('You must provide a map name'));
      return;
    }
    // eslint-disable-next-line no-alert -- Temporary
    const ok = confirm(
      _(`Are you sure you wish to delete the map: ${mapName} ?`)
    );
    if (!ok) {
      return;
    }
    /* const results = */ await getMapDataByName({
      name: mapName, method: 'DELETE'
    });

    const textImageMap = this.querySelector(this.textImageMap);
    await textImageMap.removeAllShapes({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
    await rememberLastMap({
      name: null,
      mapURL: null
    });

    // eslint-disable-next-line no-alert -- Temporary
    alert(_('Map deleted!'));
  }

  /**
   * @param {event} e
   * @returns {Promise<void>}
   */
  async imageFormSubmit (e) {
    e.preventDefault();
    const formObj = serialize(this.querySelector('form'), {hash: true});
    const mapName = this.querySelector('input[name="name"]').value;
    if (!mapName) {
      // eslint-disable-next-line no-alert -- Temporary
      alert(_('You must provide a map name'));
      return;
    }
    const map = await getMapDataByName({name: mapName});
    if (map.name) {
      // eslint-disable-next-line no-alert -- Temporary
      const ok = confirm(
        _(`Do you wish to overwrite the existing map: ${mapName}?`)
      );
      if (!ok) {
        return;
      }
    }

    const cfg = map.name
      // Overwrite
      ? {
        url: '/maps/maps/' + encodeURIComponent(mapName),
        method: 'PUT'
      }
      // Create new
      : {
        url: '/maps/maps/',
        method: 'POST'
      };

    await updateServerJSON({...cfg, data: formObj});
    this.dispatchEvent(new CustomEvent('form-view-update', {
      bubbles: true,
      detail: {
        type: 'form',
        formObj
      }
    }));
    await rememberLastMap(formObj);

    // eslint-disable-next-line no-alert -- Temporary
    alert(map.name ? _('Map overwritten!') : _('Map created!'));
  }

  /**
   * @returns {Promise<void>}
   */
  async mapNameChange () {
    const form = this.querySelector('form');
    const textImageMap = this.querySelector(this.textImageMap);
    const el = form.querySelector('input[name="name"]');
    if (!el.value) {
      this.dispatchEvent(new CustomEvent('form-update', {
        detail: {}
      }));
      return;
    }
    form.disabled = true;
    const map = await getMapDataByName({name: el.value});
    // eslint-disable-next-line no-console -- Debugging
    console.log('maps', map);
    if (map.name) {
      await textImageMap.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
      this.dispatchEvent(new CustomEvent('form-update', {
        detail: map
      }));
      await rememberLastMap(map);
    }
    form.disabled = false;
  }

  render () {
    return this.html`<form
      id="imageForm"
      onsubmit=${this.imageFormSubmit}
    >
      ${
  // Todo: Add placeholder by inserting object with `html` and `placeholder`
  (async () => {
    // Let user set values asynchronously (e.g., getting async prefs to
    //   set properties), without our needing here to bake in, or accept
    //   binding for, storage preferences
    await this.customLoader;

    // https://github.com/WebReflection/hyperHTML-Element/pull/76
    const html = HyperHTMLElement.hyper;

    return html`
    <label>
      ${_('Image map name') + nbsp2}
      <input
        name="name"
        size="100"
        value=${this.defaultMapName}
        onchange=${this.mapNameChange}
      />
      ${nbsp2}
      <button onclick=${this.mapDelete}>${_('x')}</button>
    </label>
    <br />
    <label>
      ${_('Image map URL') + nbsp2}
      <input
        name="mapURL"
        size="100"
        required="required"
        value=${this.defaultImageSrc}
      />
    </label>
    `;
  })()}
      <br />
      <fieldset>
        <div>
          <div class="imageRegions">
            <h1 id="imageAreas">${_('Image areas')}</h1>
            <ol id="imageRegions"></ol>
          </div>
          <div>
            <h2 class="preferences">${_('Preferences')}</h2>
            <label>
              <input
                type="checkbox"
                checked=${this.requireText}
                onclick=${requireTextBehavior}
              />
              ${nbsp2 + _('Require text')}
            </label>
          </div>
        </div>
      </fieldset>
      <input
        type="submit"
        value=${_('Save')}
        onclick=${this.submitFormClick}
      />
    ]);
    `;
  }
}

TextImageMapForm.define('text-image-map-form');

export default TextImageMapForm;
