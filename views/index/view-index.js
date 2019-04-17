import {jml, body} from '../../node_modules/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

export {
  mainForm, formShapeSelection, polyXYDiv,
  formControlsRect, formControlsCircle, formControlsPoly,
  formText, makeFrom
} from './view-formControls.js';

export const title = () => _('MapText demo');

export const main = ({form, behaviors}) => {
  return jml('div', {
    role: 'main' // For Axe tests (Accessbility)
  }, [
    ['div', [
      form,
      ['section', {class: 'serialized'}, [
        ['h2', [_('Serialized HTML')]],
        ['textarea', {
          id: 'serializedHTML',
          form: form.id,
          'aria-label': _('Serialized HTML'),
          $on: {input: behaviors.serializedHTMLInput}
        }]
      ]],
      ['section', {class: 'serialized'}, [
        ['h2', [_('Serialized JSON')]],
        ['textarea', {
          id: 'serializedJSON',
          form: form.id,
          'aria-label': _('Serialized JSON'),
          $on: {input: behaviors.serializedJSONInput}
        }]
      ]],
      imagePreviewContainer({behaviors})
    ]]
  ], body);
};

export const imagePreviewContainer = ({behaviors}) => ['section', [
  ['h2', [_('Image preview')]],
  ['div', [
    ['div', [
      ['a', {
        href: '#',
        id: 'rect',
        class: 'btn',
        $on: {click: behaviors.rectClick}
      }, [_('Add rectangle')]],
      ['a', {
        href: '#',
        id: 'circle',
        class: 'btn',
        $on: {click: behaviors.circleClick}
      }, [_('Add circle')]],
      ['a', {
        href: '#',
        id: 'ellipse',
        class: 'btn',
        $on: {click: behaviors.ellipseClick}
      }, [_('Add ellipse')]],
      ['a', {
        href: '#',
        id: 'remove',
        class: 'btn',
        $on: {click: behaviors.removeClick}
      }, [_('Remove shape')]],
      ['a', {
        href: '#',
        id: 'remove-all',
        class: 'btn',
        $on: {click: behaviors.removeAllClick}
      }, [_('Remove all shapes')]]
    ]],
    ['br'],
    ['div', {id: 'imagePreviewHolder'}, [
      ['div', {id: 'imagePreview'}]
    ]]
  ]]
]];

export const imagePreview = ({behaviors, src, name}) => {
  return jml('div', {id: 'imagePreview'}, [
    ['map', {name}, behaviors.mapImageMapFormObject(({shape, alt, coords}) => {
      return ['area', {
        shape,
        alt,
        coords,
        $on: {mouseover: behaviors.mouseover}
      }];
    })],
    ['img', {
      id: 'preview',
      alt: _('Selected image for map'),
      usemap: '#' + name,
      src,
      $on: {
        // Todo: We could scale using this:
        load () {
          // this.naturalWidth, this.naturalHeight
        }
      }
    }]
  ]);
};