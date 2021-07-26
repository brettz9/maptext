import {jml, nbsp} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

// Todo: Remove need for this
import {$} from '../../external/query-dollar/dollar.js';

const nbsp2 = nbsp.repeat(2);

const formText = ({
  formShapeSelection,
  currentImageRegionID, outputArea,
  requireText, prefs, li
}) => {
  /**
   * @param {Event} e
   * @returns {void}
   */
  function addImageRegionClick (e) {
    e.preventDefault();
    formShapeSelection({
      requireText,
      prevElement: li,
      prefs
    });
  }
  /**
   * @param {Event} e
   * @returns {void}
   */
  function removeImageRegionClick (e) {
    e.preventDefault();
    const imageRegions = $('#imageRegions');
    if (imageRegions.children.length === 1) {
      return;
    }
    li.remove();
  }
  return jml('div', [
    ['div', [
      ['label', [
        _('Text'), nbsp2,
        ['textarea', {
          class: 'requireText',
          name: `${currentImageRegionID}_text`,
          required: requireText
        }]
      ]]
    ]],
    ['button', {class: 'addRegion', dataset: {
      regionId: currentImageRegionID
    }, $on: {
      click: addImageRegionClick
    }}, [
      _('+')
    ]],
    ['button', {class: 'removeRegion', dataset: {
      regionId: currentImageRegionID
    }, $on: {
      click: removeImageRegionClick
    }}, [
      _('-')
    ]],
    ['br'],
    ['br']
  ], outputArea);
};

export default formText;
