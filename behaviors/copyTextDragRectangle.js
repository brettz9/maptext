/* eslint-disable require-jsdoc */
import {$} from '../node_modules/jamilih/dist/jml-es.js';
// import _ from '../external/i18n/i18n.js';

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
let text = '';

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

async function textDragRectangleMouseUp (e) {
  e.preventDefault();
  resetRect();
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    switch (permission) {
    case 'granted':
      break;
    case 'denied':
      return;
    default: case 'default':
      return;
    }
  }
  $('textarea.textToCopy').value = text;
  /*
  // Not yet supported
  const clipboardPermission =
    await navigator.permissions.request('clipboard-write');
  console.log('clipboardPermission', clipboardPermission);
  if (clipboardPermission === 'granted') {
    const data = new DataTransfer();
    // Todo: Option to switch between `text/html` and `text/plain`?
    data.items.add('text/html', text);
    await navigator.clipboard.write(data);
    // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#Parameters
    new Notification( // eslint-disable-line no-new
      // Todo: This should accept a formatted string
      _('Copied ') + text, {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir
      }
    );
  }
  */
}

function textDragRectangleMouseMove (e) {
  e.preventDefault();
  if (e.buttons !== 1) {
    return;
  }
  if (e.pageX > originalX && e.pageY > originalY) {
    rect.setAttribute('width', e.pageX - originalX);
    rect.setAttribute('height', e.pageY - originalY);
    // Todo: Change this to reflect space-joined text on areas whose
    //   coords intersect this rectangle
    text = '';
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
