import {jml, $} from '../../external/jamilih/dist/jml-es.js';
import {empty} from '../../external/dom-behaviors/dom-behaviors.js';
import _ from '../../external/i18n/i18n.js';

import formControlsRect from './formControlsRect.js';
import formControlsCircle from './formControlsCircle.js';
import formControlsPoly from './formControlsPoly.js';
import formText from './formText.js';

// Todo: Make this an instance of this element
let imgRegionID = 0;

/**
* @param {Integer} imageRegionID
* @returns {void}
*/
export function setImageRegionID (imageRegionID) {
  imgRegionID = imageRegionID;
}

let requireText;
/**
 * @param {string} reqText
 * @returns {void}
 */
export function setRequireText (reqText) {
  requireText = reqText;
}

/**
 * @param {PlainObject} cfg
 * @param {Integer} cfg.imageRegionID
 * @param {HTMLElement} cfg.prevElement
 * @param {SimplePrefs} cfg.prefs
 * @returns {void}
 */
function formShapeSelection ({
  imageRegionID = imgRegionID++, prevElement, prefs
}) {
  const currentImageRegionID = imageRegionID;

  /**
  * @param {Event} e
  * @returns {void}
  */
  function shapeSelectionChange ({target}) {
    const outputArea = this.nextElementSibling;
    empty(outputArea);
    switch (target.value) {
    case 'rect':
      formControlsRect({currentImageRegionID, outputArea});
      break;
    case 'circle':
      formControlsCircle({currentImageRegionID, outputArea});
      break;
    case 'poly': {
      const div = formControlsPoly({
        outputArea,
        currentImageRegionID
      });
      div.querySelector('button.addPoly').click();
      break;
    } default:
      break;
    }
    formText({
      formShapeSelection,
      prefs,
      li,
      requireText,
      currentImageRegionID,
      outputArea
    });
  }

  const li = jml('li', [
    ['select', {
      name: `${currentImageRegionID}_shape`,
      'aria-label': _('Shape'),
      $on: {change: shapeSelectionChange}
    }, [
      ['option', {value: 'rect'}, [_('Rectangle')]],
      ['option', {value: 'circle'}, [_('Circle')]],
      // Todo: Disable after testing!
      // Todo: https://github.com/naver/image-maps/issues/9
      ['option', {value: 'poly'}, [_('Polygon')]]
    ]],
    ['div']
  ]);

  if (prevElement) {
    prevElement.after(li);
  } else {
    jml(li, $('#imageRegions'));
  }
  li.firstElementChild.dispatchEvent(new Event('change'));
}

export default formShapeSelection;
