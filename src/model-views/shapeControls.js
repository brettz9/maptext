import {jml} from '../../external/jamilih/dist/jml-es.js';
import {$} from '../../external/query-dollar/dollar.js';
import _ from '../../external/i18n/i18n.js';

const shapeControls = ({
  setFormObjCoordsAndUpdateViewForMap
}) => {
  /**
   * @param {Event} e
   * @returns {Promise<void>}
   */
  async function rectClick (e) {
    e.preventDefault();
    const textImageMap = $('text-image-map');
    await textImageMap.addRect({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
  }
  /**
   * @param {Event} e
   * @returns {Promise<void>}
   */
  async function circleClick (e) {
    e.preventDefault();
    const textImageMap = $('text-image-map');
    await textImageMap.addCircle({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
  }
  /**
   * @param {Event} e
   * @returns {Promise<void>}
   */
  async function removeClick (e) {
    e.preventDefault();
    const textImageMap = $('text-image-map');
    await textImageMap.removeShape({
      sharedBehaviors: {
        setFormObjCoordsAndUpdateViewForMap
      }
    });
  }
  /**
   * @param {Event} e
   * @returns {Promise<void>}
   */
  async function removeAllClick (e) {
    e.preventDefault();
    const textImageMap = $('text-image-map');
    await textImageMap.removeAllShapes({
      sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
    });
  }

  return jml('div', {class: 'shapeControls'}, [
    ['a', {
      href: '#',
      id: 'rect',
      class: 'btn',
      $on: {click: rectClick}
    }, [_('Add rectangle')]],
    ['a', {
      href: '#',
      id: 'circle',
      class: 'btn',
      $on: {click: circleClick}
    }, [_('Add circle')]],
    ['a', {
      href: '#',
      id: 'remove',
      class: 'btn',
      $on: {click: removeClick}
    }, [_('Remove shape')]],
    ['a', {
      href: '#',
      id: 'remove-all',
      class: 'btn',
      $on: {click: removeAllClick}
    }, [_('Remove all shapes')]]
  ]);
};

export default shapeControls;
