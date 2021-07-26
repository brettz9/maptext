import {jml, body} from '../../external/jamilih/dist/jml-es.js';

const getView = () => {
  return jml('find-image-region-bar', {
    // Point to our selector (could be a more precise selector)
    textImageMap: 'text-image-map'
  }, body);
};

const findImageRegionBar = ({
  getSerializedJSON, prefs
}) => {
  const findImageRegionBarView = getView();

  // Supply our implementations (simpler than passing events around)
  findImageRegionBarView.getFormObject = () => {
    return getSerializedJSON();
  };
  findImageRegionBarView.useViewMode = async () => {
    return (await prefs.getPref('editMode')) === 'view';
  };
};

export default findImageRegionBar;
