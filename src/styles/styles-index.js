import loadStylesheets from '../../external/load-stylesheets/dist/index-es.js';

// Todo: Would ideally get ImageMaps to set a class instead so
//    could set these in CSS
export const shapeStyle = {
  fill: 'transparent',
  stroke: 'red',
  'stroke-width': 2
};

export const load = async () => {
  return await loadStylesheets([
    './index.css'
  ]);
};
