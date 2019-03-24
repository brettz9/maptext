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

let polyID = 0;
function addImageRegion (prevElement) {
  function makeFrom () {
    return ['span', {class: 'from'}, [_('From:')]];
  }
  function makePolyXY () {
    polyID++;
    const polyDiv = jml('div', {id: 'polyID' + polyID}, [
      polyID === 1
        ? makeFrom()
        : ['span', [_('To:')]],
      nbsp2,
      ['label', [
        _('x'),
        nbsp,
        ['input', {type: 'number', size: 5, required: true}]
      ]], nbsp2,
      ['label', [
        _('y'),
        nbsp,
        ['input', {type: 'number', size: 5, required: true}]
      ]],
      nbsp2,
      ['button', {$on: {click (e) {
        e.preventDefault();
        polyDiv.after(makePolyXY());
      }}}, [
        '+'
      ]],
      ['button', {$on: {click (e) {
        e.preventDefault();
        const buttonSets = e.target.parentElement.parentElement;
        if (buttonSets.children.length <= 2) {
          return;
        }
        const parentDiv = polyDiv.parentElement;
        polyDiv.remove();
        const fromOrTo = parentDiv.firstElementChild.firstElementChild;
        if (fromOrTo.className !== 'from') {
          fromOrTo.replaceWith(jml(...makeFrom()));
        }
      }}}, [
        '-'
      ]]
    ]);
    return polyDiv;
  }
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
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2,
          ['label', [
            _('Top y'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2,
          ['label', [
            _('Right x'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2,
          ['label', [
            _('Bottom y'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2
        ], outputArea);
        break;
      case 'circle':
        jml('div', [
          ['label', [
            _('x'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2,
          ['label', [
            _('y'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]], nbsp2,
          ['label', [
            _('r'),
            nbsp,
            ['input', {type: 'number', size: 5, required: true}]
          ]]
        ], outputArea);
        break;
      case 'poly': {
        const div = jml('div', {class: 'polyDivHolder'}, [
          makePolyXY()
        ], outputArea);
        div.querySelector('button').click();
        break;
      } default:
        break;
      }
      jml('div', [
        ['div', [
          ['label', [
            _('Text'), nbsp2,
            ['textarea', {required: true}]
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
        id: 'mapURL', size: 100, required: true,
        value: defaultImageSrc || ''
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
