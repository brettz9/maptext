/* eslint-disable require-jsdoc */
import {$} from '../node_modules/jamilih/dist/jml-es.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(SVG_NS, 'svg');
const maxWidth = 2000;
const maxHeight = maxWidth;
svg.setAttribute('width', maxWidth);
svg.setAttribute('height', maxHeight);
svg.setAttribute('class', 'selector');
const rect = document.createElementNS(SVG_NS, 'rect');
rect.setAttribute('x', 500);
rect.setAttribute('y', 500);
rect.setAttribute('class', 'selector');
svg.append(rect);

resetRect();

function resetRect () {
  rect.setAttribute('width', 10);
  rect.setAttribute('height', 10);
  svg.style.display = 'none';
}

let originalX, originalY;
function textDragRectangleMouseDown (e) {
  e.preventDefault();
  // Todo: Jamilih should support SVG (through options mode); then use here
  if (svg.style.display !== 'block') {
    svg.style.display = 'block';
  }

  originalX = e.pageX;
  originalY = e.pageY;
  rect.setAttribute('x', originalX);
  rect.setAttribute('y', originalY);
}

function textDragRectangleMouseUp (e) {
  e.preventDefault();
  resetRect();
}

function textDragRectangleMouseMove (e) {
  e.preventDefault();
  if (e.buttons !== 1) {
    return;
  }
  if (e.pageX > originalX && e.pageY > originalY) {
    rect.setAttribute('width', e.pageX - originalX);
    rect.setAttribute('height', e.pageY - originalY);
  }
}

export function enableTextDragRectangle () {
  $('#imagePreview').before(svg);
  window.addEventListener('mouseup', textDragRectangleMouseUp);
  window.addEventListener('mousemove', textDragRectangleMouseMove);
  $('#imagePreview').addEventListener('mousedown', textDragRectangleMouseDown);
}

export function disableTextDragRectangle () {
  window.removeEventListener('mouseup', textDragRectangleMouseUp);
  window.removeEventListener('mousemove', textDragRectangleMouseMove);
  $('#imagePreview').removeEventListener(
    'mousedown',
    textDragRectangleMouseDown
  );
}
