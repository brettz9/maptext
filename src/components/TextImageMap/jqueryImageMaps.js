/* globals jQuery -- No true ESM yet */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import imageMaps from '../../../external/imagemaps/dist/index.esm.js';
import {timeout} from '../../../external/dom-behaviors/dom-behaviors.js';

const jq = imageMaps(jQuery);

const mockFormForValidation = {
  reportValidity () {
    if (this.$message) {
      // alert(this.$message); // eslint-disable-line no-alert
      // eslint-disable-next-line no-console -- Debugging
      console.log('alert:', this.$message);
    }
  },
  setCustomValidity (msg) {
    if (!msg) {
      delete this.$message;
      return;
    }
    this.$message = msg;
  }
};

const jqueryImageMaps = {
  setFormObject (formObj) {
    this._formObj = formObj;
  },

  setShapeStrokeFillOptions (shapeStrokeFillOptions) {
    this._shapeStrokeFillOptions = shapeStrokeFillOptions;
  },

  async addShape (shape, {sharedBehaviors, coords}) {
    // Not sure why the timeout is necessary, but without it,
    //   the shape that is set is regularly hidden (especially
    //   when following `removeAllShapes`?); try again in case
    //   `this.src` includes default now
    await timeout(200);
    jq('img.textImageMap', this).setShapeStyle(
      this._shapeStrokeFillOptions
    ).addShape(
      coords, this.src, shape
    );
    if (sharedBehaviors) {
      const newIndex = Number.parseInt(
        jq('img.textImageMap', this).imageMaps().shapeEl.data('index')
      );
      await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index: newIndex,
        shape,
        coords,
        text: '',
        formObj: this._formObj,
        formControl: mockFormForValidation
      });
    }
  },

  addRect ({
    sharedBehaviors,
    coords = [10, 20, 300, 300]
  }) {
    return this.addShape('rect', {sharedBehaviors, coords});
  },

  addCircle ({
    sharedBehaviors,
    coords = [100, 100, 50]
  }) {
    return this.addShape('circle', {sharedBehaviors, coords});
  },

  async removeAllShapes ({sharedBehaviors} = {}) {
    try {
      jq('img.textImageMap', this).removeAllShapes();
      this.setFormObject({
        name: this._formObj.name,
        mapURL: this._formObj.mapURL
      });
    } catch (err) {
      // May not yet be present
    }

    if (sharedBehaviors) {
      // Reset to default empty rect shape
      await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index: 0,
        shape: 'rect',
        coords: ['', '', '', ''],
        text: '',
        formObj: this._formObj || {},
        formControl: mockFormForValidation,
        removeAll: true
      });
    }
  },

  async removeShape ({sharedBehaviors} = {}) {
    const imageMap = jq('img.textImageMap', this).imageMaps();
    if (imageMap.svgEl.find('._shape_face').length <= 1) {
      // Follow this routine instead which will at least set
      //   a single empty rect set rather than removing the form
      await this.removeAllShapes({sharedBehaviors});
      return;
    }

    const oldIndex = Number.parseInt(
      imageMap.shapeEl.data('index')
    );
    const {
      type: oldShapeToDelete
    } = jq('img.textImageMap', this).imageMaps().getShapeInfo(oldIndex);

    jq('img.textImageMap', this).removeShape();
    if (sharedBehaviors) {
      await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
        index: oldIndex,
        shape: undefined,
        oldShapeToDelete,
        coords: [],
        text: undefined,
        formObj: this._formObj,
        formControl: mockFormForValidation
      });
    }
  },

  setImageMaps ({formObj, mode, sharedBehaviors}) {
    this.setFormObject(formObj);
    const settings = {
      isEditMode: mode === 'edit',
      shape: 'rect',
      shapeStyle: this._shapeStrokeFillOptions,
      onClick (e, targetAreaHref) {
        // eslint-disable-next-line no-console -- Debugging
        console.log('click-targetAreaHref', targetAreaHref);
      },
      // onMouseDown (e, shapeType, coords) {},
      // We could use this but probably too aggressive
      // onMouseMove (e, shapeType, movedCoords) {},
      async onMouseUp ({target: {dataset: {index}}}, shapeType, updatedCoords) {
        const {type: shape} = this.getShapeInfo(index);

        // Won't change shape (and we don't change text here),
        //   so we only worry about coords (and only for the moved
        //   element)
        // eslint-disable-next-line no-console -- Debugging
        console.log('updatedCoords', updatedCoords);

        await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
          index,
          shape,
          coords: updatedCoords,
          text: formObj[index + '_text'] || '',
          formObj,
          formControl: mockFormForValidation
        });
      },
      onSelect (e, data) {
        console.log(data); // eslint-disable-line no-console -- Debugging
      }
    };

    jq('img.textImageMap', this).imageMaps(settings);
    // jq('img.textImageMap', this)[mode === 'edit' ? 'show' : 'hide']();
    this.showGuidesUnlessViewMode(mode);
  },

  getImageMapInfo () {
    const imageMapElement = jq('img.textImageMap', this);
    const width = imageMapElement.width();
    const height = imageMapElement.height();
    const shapes = imageMapElement.getAllShapes();
    return {width, height, shapes};
  },

  /**
   * @typedef {PlainObject} SourceInfo
   * @property {external:imageMaps.AllShapeInfo} shapes
   * @property {Float} width
   * @property {Float} height
   */

  /**
   *
   * @param {SourceInfo} sourceInfo
   * @returns {void}
   */
  copyImageMapsToImageMap (sourceInfo) {
    jq.imageMaps.copyImageMaps(sourceInfo, jq('img.textImageMap', this));
  },

  showGuidesUnlessViewMode (mode) {
    const svg = this.querySelector('map[name] > svg');
    if (svg) {
      svg.style.visibility =
        mode !== 'view' ? 'visible' : 'hidden';
    }
  },

  zoomImageMapAndResize (val) {
    const imageMap = jq('img.textImageMap', this);
    imageMap.zoom([val]);

    // for image resize
    const textImageMap = this.querySelector('.textImageMap', this);
    textImageMap.style.width = val * 0.01 * imageMap.width();
    textImageMap.style.height = val * 0.01 * imageMap.height();
  },

  getPosition () {
    return jq('img.textImageMap', this).position();
  },

  getZoom () {
    const imageMap = jq('img.textImageMap', this);
    if (this.originalImageMapWidth === undefined) {
      this.originalImageMapWidth = imageMap.width();
      this.originalImageMapHeight = imageMap.height();
    }
    const xZoom = imageMap.width() / this.originalImageMapWidth;
    const yZoom = imageMap.height() / this.originalImageMapHeight;
    return [xZoom, yZoom];
  }
};

export default jqueryImageMaps;
