// import _ from '../../../external/i18n/i18n.js';
import {$} from '../../../external/query-dollar/dollar.js';
import HyperHTMLElement from
  '../../../external/hyperhtml-element/esm/index.js';
import {timeout} from '../../../external/dom-behaviors/dom-behaviors.js';

import '../../components/FindBar/FindBar.js';
import imageMapFormObjectInfo from
  '../../components/TextImageMap/imageMapFormObjectInfo.js';

import * as TextSearch from './mapTextSearch.js';

/**
 * @callback GetFormObject
 * @returns {FormObject}
 */

/**
* @callback UseViewMode
* @returns {Promise<boolean>}
*/

/**
 * Also has "abstract" methods `getFormObject` and `useViewMode` which user
 *   must supply as well as a `textImageMap` string selector.
 */
class FindImageRegionBar extends HyperHTMLElement {
  /**
   * @returns {string[]}
   */
  static get observedAttributes () { return ['textImageMap']; }

  /**
   * @returns {void}
   */
  created () {
    this.render();
    this.querySelector(
      'input.findBar'
    ).addEventListener('input', (e) => {
      // Function must be set by user
      let formObj;
      this.dispatchEvent(new CustomEvent('get-form-object', {
        detail (obj) {
          formObj = obj;
        }
      }));

      const {value} = e.target;

      // Todo: Allow `all` mode
      // Todo: Even for "first" mode, we need to get "next"
      const mode = 'first';
      const isFirstMode = mode === 'first';

      const formObjectInfo = imageMapFormObjectInfo(formObj);
      const [
        beginSegmentIndexIndex, endSegmentIndexIndex
      ] = TextSearch.getBeginAndEndIndexes({
        formObjectInfo, value, isFirstMode
      });

      /**
       * @param {{shape: ImageDataShape, coords}} cfg
       * @returns {Promise<void>}
       */
      const blinkShape = async ({shape, coords}) => {
        let attSel;
        switch (shape) {
        case 'rect': {
          const [x, y, x2, y2] = coords;
          const width = x2 - x;
          const height = y2 - y;
          attSel = `[x="${x}"][y="${y}"][width="${width}"][height="${height}"]`;
          break;
        }
        case 'circle': {
          const [cx, cy, r] = coords;
          attSel = `[cx="${cx}"][cy="${cy}"][r="${r}"]`;
          break;
        }
        case 'polygon': {
          attSel = `[points=${coords.join(',')}]`;
          break;
        }
        default:
          throw new Error('Unexpected shape ' + shape);
        }

        const matchedShape = $(`${this.textImageMap} svg ${shape}${attSel}`);
        matchedShape.classList.add('borderBlink');
        await timeout(3000);
        matchedShape.classList.remove('borderBlink');
        /*
        // Gets correct <area>, but doesn't work to style apparently
        const matchedArea =
          $(`${this.textImageMap} area[coords="${coords.join(',')}"]`);
        console.log('matchedArea', matchedArea);
        matchedArea.classList.add('borderBlink');
        await timeout(10000);
        matchedArea.classList.remove('borderBlink');
        */
      };

      let viewMode;
      this.dispatchEvent(new CustomEvent('use-view-mode', {
        detail: (obj) => {
          viewMode = obj;
          const textImageMap = $(this.textImageMap);
          formObjectInfo.slice(
            beginSegmentIndexIndex, endSegmentIndexIndex + 1
          ).forEach(async (
            {shape, coords}
          ) => {
            // Todo: Highlight
            // console.log('matching shape & coords', shape, coords);
            if (viewMode) {
              // We don't have displayed shapes now (with accurate
              //  dimensions), so we have to build our own elements
              textImageMap.addShape(shape, {coords});
              await timeout(500);
            }
            blinkShape({shape, coords});
            if (viewMode) {
              await timeout(2000);
              textImageMap.removeShape();
            }
          });
        }
      }));
    });
  }

  /**
   * @returns {HTMLDivElement}
   */
  render () {
    return this.html`<find-bar />`;
  }
}

FindImageRegionBar.define('find-image-region-bar'); // {extends: 'ul'}

export default FindImageRegionBar;
