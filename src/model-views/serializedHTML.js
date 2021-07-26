import {jml} from '../../external/jamilih/dist/jml-es.js';
import _ from '../../external/i18n/i18n.js';

const serializedHTML = ({
  form, setFormObjCoords, updateViews
}) => {
  /**
  * @returns {Promise<void>}
  */
  async function serializedHTMLInput () {
    const html = new DOMParser().parseFromString(this.value, 'text/html');
    const map = html.querySelector('map[name]');
    const img = html.querySelector(
      `img[usemap="#${map.name}"][src]`
    );
    const areas = [...map.querySelectorAll('area')];
    if (!map || !areas.length || !img) {
      this.setCustomValidity(!map
        ? _('Missing <map name=> element ')
        : (!areas.length)
          ? _('Missing <area>')
          : _('Missing matching <img usemap= src=>'));
      this.reportValidity();
      return;
    }
    this.setCustomValidity('');

    const formObj = {
      name: map.name,
      mapURL: img.src
    };
    areas.forEach(({shape, coords, alt}, index) => {
      if (!shape || !coords) {
        return;
      }
      coords = coords.split(/,\s*/u);
      setFormObjCoords({index, shape, coords, text: alt || '', formObj});
    });
    // alert(JSON.stringify(formObj, null, 2));
    await updateViews('html', formObj, this);
  }

  return jml('section', {class: 'serialized'}, [
    ['h2', [_('Serialized HTML')]],
    ['textarea', {
      id: 'serializedHTML',
      form: form.id,
      'aria-label': _('Serialized HTML'),
      $on: {input: serializedHTMLInput}
    }]
  ]);
};

export default serializedHTML;
