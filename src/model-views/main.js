import {jml, body} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

import '../components/TextImageMap/TextImageMap.js';
import '../components/CopiedText/CopiedText.js';
import '../components/ZoomControl/ZoomControl.js';
import '../components/ImageMapModeChooser/ImageMapModeChooser.js';

import '../view-components/FindImageRegionBar/FindImageRegionBar.js';

import serializedHTML from './serializedHTML.js';
import serializedJSON from './serializedJSON.js';
import textImageMapContainer from './textImageMapContainer.js';

const main = ({
  form, mode, prefs, behaviors,
  getSerializedJSON, editableFormToImageMap,
  setFormObjCoords, updateViews, serializedJSONInput,
  setFormObjCoordsAndUpdateViewForMap
}) => {
  return jml('div', {
    role: 'main' // For Axe tests (Accessbility)
  }, [
    ['div', [
      ['h1', [_('MapText')]],
      form,
      serializedHTML({form, setFormObjCoords, updateViews}),
      serializedJSON({form, serializedJSONInput}),
      textImageMapContainer({
        mode, behaviors, prefs, getSerializedJSON, editableFormToImageMap,
        setFormObjCoordsAndUpdateViewForMap
      })
    ]]
  ], body);
};

export default main;
