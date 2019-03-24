/* eslint-disable require-jsdoc */
import {jml, body, $, nbsp} from './node_modules/jamilih/dist/jml-es.js';

function _ (s) {
  return s;
}

function empty (el) {
  while (el.firstChild) {
    el.firstChild.remove();
  }
}

// CONFIG
document.title = _('MapText demo');
const defaultImageSrc = 'Handwriting_of_Shoghi_Effendi_1919-1.jpg';
const nbsp2 = nbsp.repeat(2);

function addImageRegion (prevElement) {
  const li = jml('li', [
    ['select', {$on: {click ({target}) {
      const outputArea = this.nextElementSibling;
      empty(outputArea);
      switch (target.value) {
      case 'rect':
        jml('div', [
          ['label', [
            _('Left x'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('Top y'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('Right x'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('Bottom y'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2
        ], outputArea);
        break;
      case 'circle':
        jml('div', [
          ['label', [
            _('x'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('y'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('r'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]]
        ], outputArea);
        break;
      case 'poly':
        jml('div', [
          ['label', [
            _('x'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]], nbsp2,
          ['label', [
            _('y'),
            nbsp,
            ['input', {type: 'number', size: 5}]
          ]]
        ], outputArea);
        break;
      default:
        break;
      }
      jml('div', [
        ['div', [
          ['label', [
            _('Text'), nbsp2,
            ['textarea']
          ]]
        ]],
        ['button', {$on: {click (e) {
          e.preventDefault();
          addImageRegion(li);
        }}}, [
          _('+')
        ]],
        ['button', {$on: {click (e) {
          e.preventDefault();
          const imageRegions = $('#imageRegions');
          if (imageRegions.children.length === 1) {
            return;
          }
          li.remove();
        }}}, [
          _('-')
        ]],
        ['br'],
        ['br']
      ], outputArea);
    }}}, [
      ['option', {value: 'rect'}, [_('Rectangle')]],
      ['option', {value: 'circle'}, [_('Circle')]],
      ['option', {value: 'poly'}, [_('Polygon')]]
    ]],
    ['div', []]
  ]);
  if (prevElement) {
    prevElement.after(li);
  } else {
    jml(li, $('#imageRegions'));
  }
  li.firstElementChild.click();
}

jml('div', [
  ['form', {$on: {submit (e) {
    e.preventDefault();
    const preview = $('#preview');
    empty(preview);
    // Todo: Could allow for multiple image maps
    const id = 'map1';
    jml('div', [
      ['map', {name: id}, [
        ['area', {$on: {mouseover () {
          //
        }}}]
      ]],
      ['img', {
        usemap: '#' + id,
        src: $('#mapURL').value || defaultImageSrc
      }]
    ], preview);
  }}}, [
    ['label', [
      _('Image map URL'), nbsp,
      ['input', {
        id: 'mapURL', size: 100, value: defaultImageSrc || ''
      }]
    ]],
    ['fieldset', [
      ['div', [
        _('Image areas'),
        ['ol', {id: 'imageRegions'}]
      ]]
    ]],
    ['input', {type: 'submit', value: _('Apply')}]
  ]],
  ['section', {id: 'preview'}]
], body);

addImageRegion();
