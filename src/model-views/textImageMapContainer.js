import _ from '../../external/i18n/i18n.js';

import zoomControl from './zoomControl.js';
import imageMapModeChooser from './imageMapModeChooser.js';
import shapeControls from './shapeControls.js';

const textImageMapContainer = ({
  mode, behaviors, prefs, getSerializedJSON, editableFormToImageMap,
  setFormObjCoordsAndUpdateViewForMap
}) => ['section', [
  ['h2', [_('Image map')]],
  ['div', [
    shapeControls({
      setFormObjCoordsAndUpdateViewForMap
    }),
    ['br', 'br'],
    imageMapModeChooser({
      mode, prefs, getSerializedJSON, editableFormToImageMap
    }),
    zoomControl({mode, prefs}),
    ['copied-text'],
    ['text-image-map', {
      copiedText: 'copied-text'
    }]
  ]]
]];

export default textImageMapContainer;
