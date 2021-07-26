import {timeout} from '../../external/dom-behaviors/dom-behaviors.js';

const getFormToImageMap = ({
  prefs, styles,
  setFormObjCoordsAndUpdateViewForMap
}) => {
  const defaultShapeStyles = styles.cloneStylesOfRuleSelector(
    '.shape-style-defaults'
  );

  // Todo: Move out editable-related code to editable function
  // Move more of this into `text-image-map` itself?
  const formToImageMap = async ({
    textImageMap, formObj, mode, defaultImageSrc
  }) => {
    const {name} = formObj;

    textImageMap.name = name;

    textImageMap.src = /* $('input[name=mapURL]').value */ formObj.mapURL ||
      defaultImageSrc;

    textImageMap.setShapeStrokeFillOptions(defaultShapeStyles);
    textImageMap.setImageMaps({
      formObj,
      mode,
      sharedBehaviors: {
        setFormObjCoordsAndUpdateViewForMap
      }
    });
    textImageMap.toggleTextDragRectangleByMode(mode);

    // Todo: Should find a better way around this
    // Wait until SVG is built
    await timeout(500);

    // This could have since been modified but not yet saved
    textImageMap.setFormObject(formObj);
    textImageMap.buildImageMapAreasForFormObject();
  };

  const editableFormToImageMap = async ({textImageMap, formObj, mode}) => {
    const defaultImageSrc = await prefs.getPref('lastImageSrc');

    return await formToImageMap({
      textImageMap, formObj, mode,
      defaultImageSrc: defaultImageSrc.startsWith('http')
        ? defaultImageSrc
        : location.href + '/' + defaultImageSrc
    });
  };

  return {
    editableFormToImageMap,
    formToImageMap
  };
};

export default getFormToImageMap;
