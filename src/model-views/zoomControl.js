import {jml} from '../../external/jamilih/dist/jml-es.js';
import {$} from '../../external/query-dollar/dollar.js';

const zoomControl = ({mode, prefs}) => {
  // Triggerable by image-map-mode-chooser
  const toggleZoomByMode = ({newValue: newMode}) => {
    if (newMode === 'edit') {
      zc.disable();
    } else {
      zc.enable();
    }
  };
  prefs.listen('mode', toggleZoomByMode);

  const zoomClick = (e) => {
    const textImageMap = $('text-image-map');
    textImageMap.zoomImageMapAndResize(Number(e.target.value));
  };

  const zc = jml('zoom-control', {
    $on: {click: zoomClick}
  });

  toggleZoomByMode({newValue: mode});

  return zc;
};

export default zoomControl;
