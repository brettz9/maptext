import loadStylesheets from '../node_modules/load-stylesheets/dist/index-es.js';

export const shapeStyle = {
  fill: '#ffffff',
  stroke: 'red',
  'stroke-width': 2
};

export const load = async () => {
  // eslint-disable-next-line no-return-await
  return await loadStylesheets([
    './index.css'
  ]);
};
