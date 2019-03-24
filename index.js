/* eslint-disable require-jsdoc */
import {jml, body, $, nbsp} from './node_modules/jamilih/dist/jml-es.js';
import {serialize} from './node_modules/form-serialize/dist/index-es.js';

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
let imageRegionID = 0;
function addImageRegion (prevElement) {
  imageRegionID++;

  const currentImageRegionID = imageRegionID;
  function makeFrom () {
    return ['span', {class: 'from'}, [_('From:')]];
  }
  function makePolyXY (currImageRegionID) {
    polyID++;
    const polyDiv = jml('div', {id: 'polyID' + polyID}, [
      polyID === 1
        ? makeFrom()
        : ['span', [_('To:')]],
      nbsp2,
      ['label', [
        _('x'),
        nbsp,
        ['input', {
          name: `${currImageRegionID}-${polyID}_x`,
          type: 'number', size: 5, required: true
        }]
      ]], nbsp2,
      ['label', [
        _('y'),
        nbsp,
        ['input', {
          name: `${currImageRegionID}-${polyID}_y`,
          type: 'number', size: 5, required: true
        }]
      ]],
      nbsp2,
      ['button', {$on: {click (e) {
        e.preventDefault();
        polyDiv.after(makePolyXY(currImageRegionID));
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
    ['select', {name: `${currentImageRegionID}_shape`, $on: {click ({target}) {
      const outputArea = this.nextElementSibling;
      empty(outputArea);
      switch (target.value) {
      case 'rect':
        jml('div', [
          ['label', [
            _('Left x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_leftx`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Top y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_topy`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Right x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_rightx`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('Bottom y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_bottomy`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2
        ], outputArea);
        break;
      case 'circle':
        jml('div', [
          ['label', [
            _('x'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circlex`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('y'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circly`,
              type: 'number', size: 5, required: true
            }]
          ]], nbsp2,
          ['label', [
            _('r'),
            nbsp,
            ['input', {
              name: `${currentImageRegionID}_circler`,
              type: 'number', size: 5, required: true
            }]
          ]]
        ], outputArea);
        break;
      case 'poly': {
        const div = jml('div', {class: 'polyDivHolder'}, [
          makePolyXY(currentImageRegionID)
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
            ['textarea', {
              name: `${currentImageRegionID}_text`,
              required: true
            }]
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
    alert(JSON.stringify(serialize(this, {hash: true})));
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
