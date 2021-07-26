import loadStylesheets from '../../external/load-stylesheets/dist/index-es.js';

/**
 * @param {string[]} stylesheets
 * @returns {PlainObject}
 */
function styles (stylesheets) {
  return {
    async load () {
      return await loadStylesheets(stylesheets);
    },
    cloneStylesOfRuleSelector (selector) {
      const targetObject = {};
      const ruleList = [...document.styleSheets].find(({href}) => {
        return href.endsWith(`/${stylesheets[0]}`);
      }).cssRules;
      for (const rule of ruleList) {
        if (rule.selectorText === selector) {
          [...rule.style].forEach((prop) => {
            targetObject[prop] = rule.style[prop];
          });
        }
      }
      return targetObject;
    }
  };
}

export default styles;
