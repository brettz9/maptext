import {jml, body, nbsp} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

export {
  mainForm, formShapeSelection, polyXYDiv,
  formControlsRect, formControlsCircle, formControlsPoly,
  formText, makeFrom
} from './view-formControls.js';

export {findBar} from './view-find.js';

export const title = () => _('MapText demo');

export const main = ({form, editMode, behaviors}) => {
  return jml('div', {
    role: 'main' // For Axe tests (Accessbility)
  }, [
    ['div', [
      ['h1', [_('MapText')]],
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
      imagePreviewContainer({editMode, behaviors})
    ]]
  ], body);
};

export const imagePreviewContainer = ({editMode, behaviors}) => ['section', [
  ['h2', [_('Image preview')]],
  ['div', [
    ['div', [
      ['div', {class: 'shapeControls'}, [
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
      ['fieldset', {class: 'shapeControls'}, [
        ['legend', [_('Edit mode?')]],
        ...[
          ['Edit', 'edit'],
          ['View with guides', 'view-guides'],
          ['View', 'view']
        ].map(([i18nKey, mode]) => {
          return ['label', [
            ['input', {
              name: 'editMode',
              type: 'radio',
              checked: editMode === mode,
              value: mode,
              $on: {click: behaviors.setEditMode}
            }],
            nbsp,
            _(i18nKey),
            nbsp.repeat(3)
          ]];
        })
      ]],
      ['fieldset', {class: 'zoom'}, [
        ['legend', [_('Zoom')]],
        ['input', {
          type: 'number',
          'aria-label': _('zoom'),
          class: 'zoom',
          placeholder: _('zoom percentage')
        }],
        nbsp,
        ['a', {
          hidden: editMode === 'edit',
          href: '#', class: 'zoom btn', id: 'map-zoom',
          $on: {click: behaviors.zoomClick}
        }, [
          _('zoom')
        ]]
      ]],
      ['textarea', {
        class: 'textToCopy',
        'aria-label': _('Text to copy'),
        placeholder: _('Text to copy')
      }]
    ]],
    ['br'],
    ['div', {id: 'imagePreviewHolder'}, [
      ['div', {id: 'imagePreview'}]
    ]]
  ]]
]];

export const buildArea = ({shape, alt, coords, behaviors}) => {
  const atts = {
    shape,
    coords,
    $on: {mouseover: behaviors.mouseover}
  };
  if (alt !== undefined) { // Todo: Make this a nullable type for Jamilih
    atts.alt = alt;
  }
  return ['area', atts];
};

export const imagePreview = ({src, name}) => {
  return jml('div', {id: 'imagePreview'}, [
    ['map', {name}],
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
