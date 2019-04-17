import _ from '../../external/i18n/i18n.js';

export {
  formControlsRect, formControlsCircle, formControlsPoly
} from './formControls.js';

export const makeFrom = () => {
  return ['span', {class: 'from'}, [_('From:')]];
};
export const makeTo = () => ['span', [_('To:')]];

export const imagePreviewContainer = () => ['section', [
  ['h2', [_('Image preview')]],
  ['div', [
    ['div', [
      ['a', {
        href: '#',
        id: 'rect',
        class: 'btn'
      }, [_('Add rectangle')]],
      ['a', {
        href: '#',
        id: 'circle',
        class: 'btn'
      }, [_('Add circle')]],
      ['a', {
        href: '#',
        id: 'ellipse',
        class: 'btn'
      }, [_('Add ellipse')]],
      ['a', {
        href: '#',
        id: 'remove',
        class: 'btn'
      }, [_('Remove shape')]],
      ['a', {
        href: '#',
        id: 'remove-all',
        class: 'btn'
      }, [_('Remove all shapes')]]
    ]],
    ['br'],
    ['div', {id: 'imagePreviewHolder'}, [
      ['div', {id: 'imagePreview'}]
    ]]
  ]]
]];
