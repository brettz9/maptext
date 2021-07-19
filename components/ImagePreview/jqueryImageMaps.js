/* globals jQuery */
// NOTE: Our intended practice here to always get underlying DOM
//   methods/properties except for plugin behaviors
import imageMaps from '../../external/imagemaps/dist/index.esm.js';
import {timeout} from '../../external/dom-behaviors/dom-behaviors.js';

const jq = imageMaps(jQuery);

const mockFormForValidation = {
  reportValidity () {
    if (this.$message) {
      // alert(this.$message); // eslint-disable-line no-alert
      console.log('alert:', this.$message); // eslint-disable-line no-console, max-len
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
    jq('.preview', this).setShapeStyle(
      this._shapeStrokeFillOptions
    ).addShape(
      coords, this.src, shape
    );
    if (sharedBehaviors) {
      const newIndex = Number.parseInt(
        jq('.preview', this).imageMaps().shapeEl.data('index')
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
      jq('.preview', this).removeAllShapes();
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
    const imageMap = jq('.preview', this).imageMaps();
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
    } = jq('.preview', this).imageMaps().getShapeInfo(oldIndex);

    jq('.preview', this).removeShape();
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

  setImageMaps ({formObj, editMode, sharedBehaviors}) {
    this.setFormObject(formObj);
    const settings = {
      isEditMode: editMode === 'edit',
      shape: 'rect',
      shapeStyle: this._shapeStrokeFillOptions,
      onClick (e, targetAreaHref) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        console.log(data); // eslint-disable-line no-console
      }
    };

    jq('.preview', this).imageMaps(settings);
    // jq('.preview', this)[editMode === 'edit' ? 'show' : 'hide']();

    this.showGuidesUnlessViewMode(editMode);
  },

  getPreviewInfo () {
    const previewElement = jq('.preview', this);
    const width = previewElement.width();
    const height = previewElement.height();
    const shapes = previewElement.getAllShapes();
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
  copyImageMapsToPreview (sourceInfo) {
    jq.imageMaps.copyImageMaps(sourceInfo, jq('.preview', this));
  },

  showGuidesUnlessViewMode (editMode) {
    const svg = this.querySelector('map[name] > svg');
    if (svg) {
      svg.style.visibility =
        editMode !== 'view' ? 'visible' : 'hidden';
    }
  },

  zoomPreviewAndResize (val) {
    const preview = jq('.preview', this);
    preview.zoom([val]);

    // for image resize
    const imagePreview = this.querySelector('.imagePreview', this);
    imagePreview.style.width = val * 0.01 * preview.width();
    imagePreview.style.height = val * 0.01 * preview.height();
  },

  getPosition () {
    return jq('.preview', this).position();
  },

  getZoom () {
    const preview = jq('.preview', this);
    if (this.originalPreviewWidth === undefined) {
      this.originalPreviewWidth = preview.width();
      this.originalPreviewHeight = preview.height();
    }
    const xZoom = preview.width() / this.originalPreviewWidth;
    const yZoom = preview.height() / this.originalPreviewHeight;
    return [xZoom, yZoom];
  }
};

export default jqueryImageMaps;
