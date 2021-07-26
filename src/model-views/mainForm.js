import {jml, nbsp} from '../../external/jamilih/dist/jml-es.js';
import {$} from '../../external/query-dollar/dollar.js';
import _ from '../../external/i18n/i18n.js';
import {serialize} from '../../external/form-serialization/dist/index-es.js';

const nbsp2 = nbsp.repeat(2);

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

const mainForm = ({
  defaultMapName, defaultImageSrc, initialPrefs,
  updateViews, getMapDataByName, setFormObjCoordsAndUpdateViewForMap,
  rememberLastMap, requireTextBehavior, mapNameChange
}) => {
  /**
   * @param {event} e
   * @returns {Promise<void>}
   */
  async function mapDelete (e) {
    e.preventDefault();
    const mapName = $('input[name="name"]').value;
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

    const textImageMap = $('text-image-map');
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
  async function imageFormSubmit (e) {
    e.preventDefault();
    const formObj = serialize(this, {hash: true});
    const mapName = $('input[name="name"]').value;
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
    await updateViews('form', formObj);
    await rememberLastMap(formObj);

    // eslint-disable-next-line no-alert -- Temporary
    alert(map.name ? _('Map overwritten!') : _('Map created!'));
  }

  /**
   * @returns {void}
   */
  function submitFormClick () {
    // To try again, we reset invalid forms, e.g., from previous bad JSON
    [...form.elements].forEach((ctrl) => {
      ctrl.setCustomValidity('');
    });
  }

  const form = jml('form', {
    id: 'imageForm',
    $on: {submit: imageFormSubmit}
  }, [
    ['label', [
      _('Image map name'), nbsp2,
      ['input', {
        name: 'name', size: 100,
        value: defaultMapName,
        $on: {change: mapNameChange}
      }],
      nbsp2,
      ['button', {$on: {click: mapDelete}}, [_('x')]]
    ]],
    ['br'],
    ['label', [
      _('Image map URL'), nbsp2,
      ['input', {
        name: 'mapURL', size: 100, required: true,
        value: defaultImageSrc
      }]
    ]],
    ['br'],
    ['fieldset', [
      ['div', [
        ['div', {class: 'imageRegions'}, [
          ['h1', {id: 'imageAreas'}, [_('Image areas')]],
          ['ol', {id: 'imageRegions'}]
        ]],
        ['div', [
          ['h2', {class: 'preferences'}, [_('Preferences')]],
          ['label', [
            ['input', {
              type: 'checkbox',
              checked: initialPrefs.requireText,
              $on: {
                click: requireTextBehavior
              }
            }], nbsp2,
            _('Require text')
          ]]
        ]]
      ]]
    ]],
    ['input', {type: 'submit', value: _('Save'), $on: {
      click: submitFormClick
    }}]
  ]);
  return form;
};

export default mainForm;
