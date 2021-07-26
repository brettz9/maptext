import {jml} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const serializedJSON = ({
  form, serializedJSONInput
}) => {
  return jml('section', {class: 'serialized'}, [
    ['h2', [_('Serialized JSON')]],
    ['textarea', {
      id: 'serializedJSON',
      form: form.id,
      'aria-label': _('Serialized JSON'),
      $on: {input: serializedJSONInput}
    }]
  ]);
};

export default serializedJSON;
