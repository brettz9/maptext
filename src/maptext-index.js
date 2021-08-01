import {$} from '../external/query-dollar/dollar.js';
// Todo: Switch to npm version
import _ from '../external/i18n/i18n.js';
import {SimplePrefs} from '../external/simple-prefs/dist/index.esm.js';
import getStyles from '../external/get-styles/getStyles.js';

import findImageRegionBar from './model-views/findImageRegionBar.js';
import formShapeSelection, {
  setRequireText
} from './model-views/formShapeSelection.js';
import main from './model-views/main.js';

const styles = getStyles([
  'index.css'
]);

const prefs = new SimplePrefs({namespace: 'maptext-', defaults: {
  lastMapName: `map0`,
  lastImageSrc: 'sample-image-texts/Handwriting_of_Shoghi_Effendi_1919-1.jpg',
  requireText: true,
  mode: 'edit'
}});

document.title = _('MapText demo');
// Todo: Detect locale and use https://github.com/brettz9/i18nizeElement
document.documentElement.lang = 'en-US';
document.documentElement.dir = 'ltr';

(async () => {
const [
  requireText,
  mode
] = await Promise.all([
  prefs.getPref('requireText'),
  prefs.getPref('mode'),
  styles.load()
]);

setRequireText(requireText);

const formID = 'main-text-image-map-form';
main({
  formID,
  prefs,
  mode,
  styles,
  requireText
});

formShapeSelection({prefs, requireText});

// Is this necessary now?
$(`#${formID}`).mapNameChange();

findImageRegionBar({prefs});
})();
