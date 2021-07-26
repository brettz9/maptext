import {jml, nbsp} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const nbsp2 = nbsp.repeat(2);

const makeFrom = () => {
  return ['span', {class: 'from'}, [_('From:')]];
};
const makeTo = () => ['span', [_('To:')]];

/**
 * @param {Integer} currImageRegionID
 * @param {boolean} from
 * @returns {HTMLDivElement}
 */
function editPolyXY (currImageRegionID, from = false) {
  /**
   * @param {Event} e
   * @returns {void}
   */
  function addPolyClick (e) {
    e.preventDefault();
    polyDiv.after(editPolyXY(currImageRegionID));
  }
  /**
   * @param {Event} e
   * @returns {void}
   */
  function removePolyClick (e) {
    e.preventDefault();
    const buttonSets = polyDiv.parentElement;
    if (buttonSets.children.length <= 2) {
      return;
    }
    polyDiv.remove();
    const firstButtonSet = buttonSets.firstElementChild;
    const fromOrTo = firstButtonSet.firstElementChild;
    if (fromOrTo.className !== 'from') {
      fromOrTo.replaceWith(jml(...makeFrom()));
    }
  }

  const polyDiv = jml('div', [
    from
      ? makeFrom()
      : makeTo(),
    nbsp2,
    ['label', [
      _('x'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]], nbsp2,
    ['label', [
      _('y'),
      nbsp,
      ['input', {
        name: `${currImageRegionID}_xy`,
        type: 'number', size: 5, required: true, value: 1
      }]
    ]],
    nbsp2,
    ['button', {class: 'addPoly', $on: {
      click: addPolyClick
    }}, [
      '+'
    ]],
    ['button', {class: 'removePoly', $on: {
      click: removePolyClick
    }}, [
      '-'
    ]]
  ]);
  return polyDiv;
}

export default editPolyXY;
