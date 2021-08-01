import {jml, $} from '../../external/jamilih/dist/jml-es.js';

const imageMapModeChooser = ({
  mode, prefs,
  editableFormToImageMap
}) => {
  const formToImageMap = async function (e) {
    const formObj = $('serialized-json').getJSON();
    const {args, callback} = e.detail;
    await prefs.setPref('mode', args.mode);
    await editableFormToImageMap({...args, formObj});
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- Easier
    callback();
  };

  return jml('image-map-mode-chooser', {
    mode,
    // Could give more precise selector on right side
    'text-image-map': 'text-image-map',
    $on: {
      'form-to-image-map': formToImageMap
    }
  });
};

export default imageMapModeChooser;
