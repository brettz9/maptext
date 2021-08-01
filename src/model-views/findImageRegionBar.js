import {jml, $, body} from '../../external/jamilih/dist/jml-es.js';

const findImageRegionBar = ({
  getJSON, prefs
}) => {
  return jml('find-image-region-bar', {
    // Point to our selector (could be a more precise selector)
    textImageMap: 'text-image-map',
    $on: {
      'get-form-object' (e) {
        e.detail($('serialized-json').getJSON());
      },
      async 'use-view-mode' (e) {
        e.detail((await prefs.getPref('mode')) === 'view');
      }
    }
  }, body);
};

export default findImageRegionBar;
