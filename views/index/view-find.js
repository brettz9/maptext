import {jml, nbsp, body} from '../../node_modules/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

export const findBar = ({magnifyingGlassText, behaviors}) => {
  jml('div', {class: 'findBar'}, [
    magnifyingGlassText,
    nbsp.repeat(2),
    // `type=search` for clear-results button
    ['input', {
      type: 'search',
      class: 'findBar',
      placeholder: _('Search for text'),
      $on: {input: behaviors.input}
    }],
    nbsp,
    ['button', {class: 'cancel'}, {$on: {click: behaviors.cancel}}, [_('x')]]
  ], body);
};
