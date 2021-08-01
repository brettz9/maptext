(function () {
  'use strict';

  const $$1 = (sel) => {
    return document.querySelector(sel);
  };

  const $$ = (sel) => {
    return document.querySelectorAll(sel);
  };

  /**
   *
   * @param {string} s
   * @param {Error} err Specific error message
   * @todo Move to own class
   * @returns {string}
   */
  function _ (s, err) {
    return s + (err ? ` (${err.message})` : '');
  }

  function _classCallCheck$2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$2(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$2(Constructor, staticProps);
    return Constructor;
  }

  /**
   * @module SimplePrefs
   */

  /**
  * @typedef {PlainObject<{
  * string: module:SimplePrefs.Value}>} module:SimplePrefs.Defaults
  */

  /**
  * @typedef {boolean|number|string} module:SimplePrefs.Value
  */

  /**
   * Preferences storage.
   */
  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    if (!value || !value.then) {
      value = Promise.resolve(value);
    }

    return then ? value.then(then) : value;
  }
  /**
   * Defaults for SimplePrefs.
   */


  var SimplePrefs = /*#__PURE__*/function () {
    /**
     * @param {PlainObject} cfg
     * @param {string} cfg.namespace Avoid clashes with other apps
     * @param {module:SimplePrefs.Defaults} cfg.defaults
     * @param {module:SimplePrefs.SimplePrefsDefaults} cfg.prefDefaults
     * @returns {void}
     */
    function SimplePrefs(cfg) {
      _classCallCheck$2(this, SimplePrefs);

      this.configurePrefs(cfg);
      this.listeners = [];
    }
    /**
     * @param {PlainObject} cfg
     * @param {string} cfg.namespace Avoid clashes with other apps
     * @param {module:SimplePrefs.Defaults} cfg.defaults
     * @param {module:SimplePrefs.SimplePrefsDefaults} cfg.prefDefaults
     * @returns {void}
     */


    _createClass$2(SimplePrefs, [{
      key: "configurePrefs",
      value: function configurePrefs(_ref) {
        var namespace = _ref.namespace,
            defaults = _ref.defaults,
            _ref$prefDefaults = _ref.prefDefaults,
            prefDefaults = _ref$prefDefaults === void 0 ? simplePrefsDefaults(defaults) : _ref$prefDefaults;
        Object.assign(this, {
          namespace: namespace,
          prefDefaults: prefDefaults
        });
      }
      /**
       * Get parsed preference value; returns `Promise` in anticipation
       * of https://domenic.github.io/async-local-storage/ .
       * @param {string} key Preference key (for Chrome-Compatibility, only `\w+`)
       * @returns {Promise<module:SimplePrefs.Value>} Resolves to the parsed
       *   value (defaulting if necessary)
       */

    }, {
      key: "getPref",
      value: function getPref(key) {
        try {
          var _this2 = this;

          var result = localStorage.getItem(_this2.namespace + key);
          return _await(result === null ? _this2.prefDefaults.getPrefDefault(key) : JSON.parse(result), void 0, !(result === null));
        } catch (e) {
          return Promise.reject(e);
        }
      }
      /**
       * Set a stringifiable preference value; returns `Promise` in anticipation
       *   of https://domenic.github.io/async-local-storage/ .
       * @param {string} key Preference key (for Chrome-Compatibility, only `\w+`)
       * @param {module:SimplePrefs.Value} val Stringifiable value
       * @returns {Promise<void>} Resolves after setting the item (Not currently
       *    in use)
       */

    }, {
      key: "setPref",
      value: function setPref(key, val) {
        try {
          var _this4 = this;

          return _await(localStorage.setItem(_this4.namespace + key, JSON.stringify(val)));
        } catch (e) {
          return Promise.reject(e);
        }
      }
      /**
      * @typedef {PlainObject} GetPrefSetPref
      * @property {module:SimplePrefs.SimplePrefs#getPref} getPref
      * @property {module:SimplePrefs.SimplePrefs#setPref} setPref
      */

      /**
       * Convenience utility to return two main methods `getPref` and
       *   `setPref` bound to the current object.
       * @returns {GetPrefSetPref}
       */

    }, {
      key: "bind",
      value: function bind() {
        return {
          getPref: this.getPref.bind(this),
          setPref: this.setPref.bind(this)
        };
      }
      /**
      * @callback PreferenceCallback
      * @returns {void}
      */

      /* eslint-disable promise/prefer-await-to-callbacks -- Repeating event */

      /**
      * @param {string} [key]
      * @param {PreferenceCallback} cb
      * @returns {void}
      */

    }, {
      key: "listen",
      value: function listen(key, cb) {
        var _this5 = this;

        if (typeof key === 'function') {
          cb = key;
          key = undefined;
        }

        var listener = function listener(e) {
          if (e.key === null) {
            // `null` for clear browser action or user `clear()`
            if (key === undefined) {
              // Only trigger when no key supplied
              return;
            }
          } else {
            if (!e.key.startsWith(_this5.namespace)) {
              return;
            }

            if (key !== undefined && !e.key.startsWith(_this5.namespace + key)) {
              return;
            }
          }

          cb(e);
        };

        window.addEventListener('storage', listener);
        this.listeners.push(listener);
        return listener;
      }
      /**
       * @param {EventListener} listener
       * @returns {void}
       */

    }, {
      key: "unlisten",
      value: function unlisten(listener) {
        if (listener) {
          for (var i = 0; i < this.listeners.length; i++) {
            if (listener === this.listeners[i]) {
              this.listeners.splice(i, 1);
              window.removeEventListener('storage', listener);
              return;
            }
          }
        }

        this.listeners.forEach(function (listenerItem) {
          window.removeEventListener('storage', listenerItem);
        });
      }
      /* eslint-enable promise/prefer-await-to-callbacks -- Repeating event */

    }]);

    return SimplePrefs;
  }();
  var SimplePrefsDefaults = /*#__PURE__*/function () {
    /**
     *
     * @param {module:SimplePrefs.Defaults} defaults
     */
    function SimplePrefsDefaults(_ref2) {
      var defaults = _ref2.defaults;

      _classCallCheck$2(this, SimplePrefsDefaults);

      this.defaults = defaults;
    }
    /**
     * Get parsed default value for a preference.
     * @param {string} key Preference key
     * @returns {Promise<module:SimplePrefs.Value>}
     */


    _createClass$2(SimplePrefsDefaults, [{
      key: "getPrefDefault",
      value: function getPrefDefault(key) {
        try {
          var _this7 = this;

          return _await(_this7.defaults[key]);
        } catch (e) {
          return Promise.reject(e);
        }
      }
      /**
       * Set parsed default value for a preference.
       * @param {string} key Preference key
       * @param {module:SimplePrefs.Value} value
       * @returns {Promise<module:SimplePrefs.Value>} The old value
       */

    }, {
      key: "setPrefDefault",
      value: function setPrefDefault(key, value) {
        try {
          var _this9 = this;

          var oldValue = _this9.defaults[key];
          _this9.defaults[key] = value;
          return _await(oldValue);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);

    return SimplePrefsDefaults;
  }();
  /**
   * Simplified factory for `SimplePrefsDefaults`
   * @param {module:SimplePrefs.Defaults} defaults
   * @returns {module:SimplePrefs.SimplePrefsDefaults}
   */

  function simplePrefsDefaults(defaults) {
    return new SimplePrefsDefaults({
      defaults: defaults
    });
  }

  function _slicedToArray$3(arr, i) {
    return _arrayWithHoles$3(arr) || _iterableToArrayLimit$3(arr, i) || _unsupportedIterableToArray$3(arr, i) || _nonIterableRest$3();
  }

  function _arrayWithHoles$3(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit$3(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray$3(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$3(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen);
  }

  function _arrayLikeToArray$3(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest$3() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function loadStylesheets(stylesheets) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        beforeDefault = _ref.before,
        afterDefault = _ref.after,
        faviconDefault = _ref.favicon,
        canvasDefault = _ref.canvas,
        _ref$image = _ref.image,
        imageDefault = _ref$image === void 0 ? true : _ref$image,
        acceptErrors = _ref.acceptErrors;

    stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

    function setupLink(stylesheetURL) {
      var options = {};

      if (Array.isArray(stylesheetURL)) {
        var _stylesheetURL = stylesheetURL;

        var _stylesheetURL2 = _slicedToArray$3(_stylesheetURL, 2);

        stylesheetURL = _stylesheetURL2[0];
        var _stylesheetURL2$ = _stylesheetURL2[1];
        options = _stylesheetURL2$ === void 0 ? {} : _stylesheetURL2$;
      }

      var _options = options,
          _options$favicon = _options.favicon,
          favicon = _options$favicon === void 0 ? faviconDefault : _options$favicon;
      var _options2 = options,
          _options2$before = _options2.before,
          before = _options2$before === void 0 ? beforeDefault : _options2$before,
          _options2$after = _options2.after,
          after = _options2$after === void 0 ? afterDefault : _options2$after,
          _options2$canvas = _options2.canvas,
          canvas = _options2$canvas === void 0 ? canvasDefault : _options2$canvas,
          _options2$image = _options2.image,
          image = _options2$image === void 0 ? imageDefault : _options2$image;

      function addLink() {
        if (before) {
          before.before(link);
        } else if (after) {
          after.after(link);
        } else {
          document.head.appendChild(link);
        }
      }

      var link = document.createElement('link'); // eslint-disable-next-line promise/avoid-new -- No native option

      return new Promise(function (resolve, reject) {
        var rej = reject;

        if (acceptErrors) {
          rej = typeof acceptErrors === 'function' ? function (error) {
            acceptErrors({
              error: error,
              stylesheetURL: stylesheetURL,
              options: options,
              resolve: resolve,
              reject: reject
            });
          } : resolve;
        }

        if (stylesheetURL.endsWith('.css')) {
          favicon = false;
        } else if (stylesheetURL.endsWith('.ico')) {
          favicon = true;
        }

        if (favicon) {
          link.rel = 'shortcut icon';
          link.type = 'image/x-icon';

          if (image === false) {
            link.href = stylesheetURL;
            addLink();
            resolve(link);
            return;
          }

          var cnv = document.createElement('canvas');
          cnv.width = 16;
          cnv.height = 16;
          var context = cnv.getContext('2d');
          var img = document.createElement('img'); // eslint-disable-next-line promise/prefer-await-to-callbacks -- No API

          img.addEventListener('error', function (error) {
            reject(error);
          });
          img.addEventListener('load', function () {
            context.drawImage(img, 0, 0);
            link.href = canvas ? cnv.toDataURL('image/x-icon') : stylesheetURL;
            addLink();
            resolve(link);
          });
          img.src = stylesheetURL;
          return;
        }

        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = stylesheetURL;
        addLink(); // eslint-disable-next-line promise/prefer-await-to-callbacks -- No API

        link.addEventListener('error', function (error) {
          rej(error);
        });
        link.addEventListener('load', function () {
          resolve(link);
        });
      });
    }

    return Promise.all(stylesheets.map(function (stylesheetURL) {
      return setupLink(stylesheetURL);
    }));
  }

  /**
   * @param {string[]} stylesheets
   * @returns {PlainObject}
   */
  function styles$1 (stylesheets) {
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

  /*
  Possible todos:
  0. Add XSLT to JML-string stylesheet (or even vice versa)
  0. IE problem: Add JsonML code to handle name attribute (during element creation)
  0. Element-specific: IE object-param handling

  Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

  0. duplicate attributes?
  0. expand ATTR_MAP
  0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
  0. More validation?
  0. JsonML DOM Level 0 listener
  0. Whitespace trimming?

  JsonML element-specific:
  0. table appending
  0. canHaveChildren necessary? (attempts to append to script and img)

  Other Todos:
  0. Note to self: Integrate research from other jml notes
  0. Allow Jamilih to be seeded with an existing element, so as to be able to add/modify attributes and children
  0. Allow array as single first argument
  0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
  0. Allow building of generic XML (pass configuration object)
  0. Allow building content internally as a string (though allowing DOM methods, etc.?)
  0. Support JsonML empty string element name to represent fragments?
  0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
  */
  // istanbul ignore next
  let win = typeof window !== 'undefined' && window; // istanbul ignore next

  let doc = typeof document !== 'undefined' && document || win && win.document; // STATIC PROPERTIES

  const possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
  // '$state', // Used internally
  '$map' // Add any other options here
  ];
  const NS_HTML = 'http://www.w3.org/1999/xhtml',
        hyphenForCamelCase = /-([a-z])/gu;
  const ATTR_MAP = {
    maxlength: 'maxLength',
    minlength: 'minLength',
    readonly: 'readOnly'
  }; // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
  // We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
  //   (e.g., from an empty variable) on templates to have no effect

  const BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
  'readOnly', 'selected']; // From JsonML

  const ATTR_DOM = BOOL_ATTS.concat(['accessKey', // HTMLElement
  'async', 'autocapitalize', // HTMLElement
  'autofocus', 'contentEditable', // HTMLElement through ElementContentEditable
  'defaultValue', 'defer', 'draggable', // HTMLElement
  'formnovalidate', 'hidden', // HTMLElement
  'innerText', // HTMLElement
  'inputMode', // HTMLElement through ElementContentEditable
  'ismap', 'multiple', 'novalidate', 'pattern', 'required', 'spellcheck', // HTMLElement
  'translate', // HTMLElement
  'value', 'willvalidate']); // Todo: Add more to this as useful for templating
  //   to avoid setting through nullish value

  const NULLABLES = ['autocomplete', 'dir', // HTMLElement
  'integrity', // script, link
  'lang', // HTMLElement
  'max', 'min', 'minLength', 'maxLength', 'title' // HTMLElement
  ];

  const $ = sel => doc.querySelector(sel);
  /**
  * Retrieve the (lower-cased) HTML name of a node.
  * @static
  * @param {Node} node The HTML node
  * @returns {string} The lower-cased node name
  */


  function _getHTMLNodeName(node) {
    return node.nodeName && node.nodeName.toLowerCase();
  }
  /**
  * Apply styles if this is a style tag.
  * @static
  * @param {Node} node The element to check whether it is a style tag
  * @returns {void}
  */


  function _applyAnyStylesheet(node) {
    // Only used in IE
    // istanbul ignore else
    if (!doc.createStyleSheet) {
      return;
    } // istanbul ignore next


    if (_getHTMLNodeName(node) === 'style') {
      // IE
      const ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful

      ss.cssText = node.cssText; // We continue to add the style tag, however
    }
  }
  /**
   * Need this function for IE since options weren't otherwise getting added.
   * @private
   * @static
   * @param {Element} parent The parent to which to append the element
   * @param {Node} child The element or other node to append to the parent
   * @throws {Error} Rethrow if problem with `append` and unhandled
   * @returns {void}
   */


  function _appendNode(parent, child) {
    const parentName = _getHTMLNodeName(parent); // IE only
    // istanbul ignore if


    if (doc.createStyleSheet) {
      if (parentName === 'script') {
        parent.text = child.nodeValue;
        return;
      }

      if (parentName === 'style') {
        parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents

        return;
      }
    }

    if (parentName === 'template') {
      parent.content.append(child);
      return;
    }

    try {
      parent.append(child); // IE9 is now ok with this
    } catch (e) {
      // istanbul ignore next
      const childName = _getHTMLNodeName(child); // istanbul ignore next


      if (parentName === 'select' && childName === 'option') {
        try {
          // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
          parent.add(child);
        } catch (err) {
          // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
          parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
        }

        return;
      } // istanbul ignore next


      throw e;
    }
  }
  /**
   * Attach event in a cross-browser fashion.
   * @static
   * @param {Element} el DOM element to which to attach the event
   * @param {string} type The DOM event (without 'on') to attach to the element
   * @param {EventListener} handler The event handler to attach to the element
   * @param {boolean} [capturing] Whether or not the event should be
   *   capturing (W3C-browsers only); default is false; NOT IN USE
   * @returns {void}
   */


  function _addEvent(el, type, handler, capturing) {
    el.addEventListener(type, handler, Boolean(capturing));
  }
  /**
  * Creates a text node of the result of resolving an entity or character reference.
  * @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
  * @param {string} prefix Text to prefix immediately after the "&"
  * @param {string} arg The body of the reference
  * @throws {TypeError}
  * @returns {Text} The text node of the resolved reference
  */


  function _createSafeReference(type, prefix, arg) {
    // For security reasons related to innerHTML, we ensure this string only
    //  contains potential entity characters
    if (!/^\w+$/u.test(arg)) {
      throw new TypeError(`Bad ${type} reference; with prefix "${prefix}" and arg "${arg}"`);
    }

    const elContainer = doc.createElement('div'); // Todo: No workaround for XML?
    // eslint-disable-next-line no-unsanitized/property

    elContainer.innerHTML = '&' + prefix + arg + ';';
    return doc.createTextNode(elContainer.innerHTML);
  }
  /**
  * @param {string} n0 Whole expression match (including "-")
  * @param {string} n1 Lower-case letter match
  * @returns {string} Uppercased letter
  */


  function _upperCase(n0, n1) {
    return n1.toUpperCase();
  } // Todo: Make as public utility

  /**
   * @param {any} o
   * @returns {boolean}
   */


  function _isNullish(o) {
    return o === null || o === undefined;
  } // Todo: Make as public utility, but also return types for undefined, boolean, number, document, etc.

  /**
  * @private
  * @static
  * @param {string|JamilihAttributes|JamilihArray|Element|DocumentFragment} item
  * @returns {"string"|"null"|"array"|"element"|"fragment"|"object"|"symbol"|"function"|"number"|"boolean"}
  */


  function _getType(item) {
    const type = typeof item;

    switch (type) {
      case 'object':
        if (item === null) {
          return 'null';
        }

        if (Array.isArray(item)) {
          return 'array';
        }

        if ('nodeType' in item) {
          switch (item.nodeType) {
            case 1:
              return 'element';

            case 9:
              return 'document';

            case 11:
              return 'fragment';

            default:
              return 'non-container node';
          }
        }

      // Fallthrough

      default:
        return type;
    }
  }
  /**
  * @private
  * @static
  * @param {DocumentFragment} frag
  * @param {Node} node
  * @returns {DocumentFragment}
  */


  function _fragReducer(frag, node) {
    frag.append(node);
    return frag;
  }
  /**
  * @private
  * @static
  * @param {Object<{string:string}>} xmlnsObj
  * @returns {string}
  */


  function _replaceDefiner(xmlnsObj) {
    return function (n0) {
      let retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0; // Preserve XHTML

      for (const [ns, xmlnsVal] of Object.entries(xmlnsObj)) {
        if (ns !== '') {
          retStr += ' xmlns:' + ns + '="' + xmlnsVal + '"';
        }
      }

      return retStr;
    };
  }
  /**
  * @typedef {JamilihAttributes} AttributeArray
  * @property {string} 0 The key
  * @property {string} 1 The value
  */

  /**
  * @callback ChildrenToJMLCallback
  * @param {JamilihArray|Jamilih} childNodeJML
  * @param {Integer} i
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {ChildrenToJMLCallback}
  */


  function _childrenToJML(node) {
    return function (childNodeJML, i) {
      const cn = node.childNodes[i];
      const j = Array.isArray(childNodeJML) ? jml(...childNodeJML) : jml(childNodeJML);
      cn.replaceWith(j);
    };
  }
  /**
  * @callback JamilihAppender
  * @param {JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {JamilihAppender}
  */


  function _appendJML(node) {
    return function (childJML) {
      if (Array.isArray(childJML)) {
        node.append(jml(...childJML));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @callback appender
  * @param {string|JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {appender}
  */


  function _appendJMLOrText(node) {
    return function (childJML) {
      if (typeof childJML === 'string') {
        node.append(childJML);
      } else if (Array.isArray(childJML)) {
        node.append(jml(...childJML));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @private
  * @static
  */

  /*
  function _DOMfromJMLOrString (childNodeJML) {
    if (typeof childNodeJML === 'string') {
      return doc.createTextNode(childNodeJML);
    }
    return jml(...childNodeJML);
  }
  */

  /**
  * @typedef {Element|DocumentFragment} JamilihReturn
  */

  /**
  * @typedef {PlainObject<string, string>} JamilihAttributes
  */

  /**
  * @typedef {GenericArray} JamilihArray
  * @property {string} 0 The element to create (by lower-case name)
  * @property {JamilihAttributes} [1] Attributes to add with the key as the
  *   attribute name and value as the attribute value; important for IE where
  *   the input element's type cannot be added later after already added to the page
  * @param {Element[]} [children] The optional children of this element
  *   (but raw DOM elements required to be specified within arrays since
  *   could not otherwise be distinguished from siblings being added)
  * @param {Element} [parent] The optional parent to which to attach the element
  *   (always the last unless followed by null, in which case it is the
  *   second-to-last)
  * @param {null} [returning] Can use null to indicate an array of elements
  *   should be returned
  */

  /**
  * @typedef {PlainObject} JamilihOptions
  * @property {"root"|"attributeValue"|"fragment"|"children"|"fragmentChildren"} $state
  */

  /**
   * @param {Element} elem
   * @param {string} att
   * @param {string} attVal
   * @param {JamilihOptions} opts
   * @returns {void}
   */


  function checkPluginValue(elem, att, attVal, opts) {
    opts.$state = 'attributeValue';

    if (attVal && typeof attVal === 'object') {
      const matchingPlugin = getMatchingPlugin(opts, Object.keys(attVal)[0]);

      if (matchingPlugin) {
        return matchingPlugin.set({
          opts,
          element: elem,
          attribute: {
            name: att,
            value: attVal
          }
        });
      }
    }

    return attVal;
  }
  /**
   * @param {JamilihOptions} opts
   * @param {string} item
   * @returns {JamilihPlugin}
   */


  function getMatchingPlugin(opts, item) {
    return opts.$plugins && opts.$plugins.find(p => {
      return p.name === item;
    });
  }
  /**
   * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
   * that support); any element after element can be omitted, and any subsequent
   * type or types added afterwards.
   * @param {...JamilihArray} args
   * @returns {JamilihReturn} The newly created (and possibly already appended)
   *   element or array of elements
   */


  const jml = function jml(...args) {
    let elem = doc.createDocumentFragment();
    /**
     *
     * @param {Object<{string: string}>} atts
     * @throws {TypeError}
     * @returns {void}
     */

    function _checkAtts(atts) {
      for (let [att, attVal] of Object.entries(atts)) {
        att = att in ATTR_MAP ? ATTR_MAP[att] : att;

        if (NULLABLES.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);

          if (!_isNullish(attVal)) {
            elem[att] = attVal;
          }

          continue;
        } else if (ATTR_DOM.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);
          elem[att] = attVal;
          continue;
        }

        switch (att) {
          /*
          Todos:
          0. JSON mode to prevent event addition
           0. {$xmlDocument: []} // doc.implementation.createDocument
           0. Accept array for any attribute with first item as prefix and second as value?
          0. {$: ['xhtml', 'div']} for prefixed elements
            case '$': // Element with prefix?
              nodes[nodes.length] = elem = doc.createElementNS(attVal[0], attVal[1]);
              break;
          */
          case '#':
            {
              // Document fragment
              opts.$state = 'fragmentChilden';
              nodes[nodes.length] = jml(opts, attVal);
              break;
            }

          case '$shadow':
            {
              const {
                open,
                closed
              } = attVal;
              let {
                content,
                template
              } = attVal;
              const shadowRoot = elem.attachShadow({
                mode: closed || open === false ? 'closed' : 'open'
              });

              if (template) {
                if (Array.isArray(template)) {
                  template = _getType(template[0]) === 'object' ? jml('template', ...template, doc.body) : jml('template', template, doc.body);
                } else if (typeof template === 'string') {
                  template = $(template);
                }

                jml(template.content.cloneNode(true), shadowRoot);
              } else {
                if (!content) {
                  content = open || closed;
                }

                if (content && typeof content !== 'boolean') {
                  if (Array.isArray(content)) {
                    jml({
                      '#': content
                    }, shadowRoot);
                  } else {
                    jml(content, shadowRoot);
                  }
                }
              }

              break;
            }

          case '$state':
            {
              // Handled internally
              break;
            }

          case 'is':
            {
              // Currently only in Chrome
              // Handled during element creation
              break;
            }

          case '$custom':
            {
              Object.assign(elem, attVal);
              break;
            }

          /* istanbul ignore next */

          case '$define':
            {
              const localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

              const customizedBuiltIn = !localName.includes('-'); // We check attribute in case this is a preexisting DOM element
              // const {is} = atts;

              let is;

              if (customizedBuiltIn) {
                is = elem.getAttribute('is');

                if (!is) {
                  if (!{}.hasOwnProperty.call(atts, 'is')) {
                    throw new TypeError(`Expected \`is\` with \`$define\` on built-in; args: ${JSON.stringify(args)}`);
                  }

                  atts.is = checkPluginValue(elem, 'is', atts.is, opts);
                  elem.setAttribute('is', atts.is);
                  ({
                    is
                  } = atts);
                }
              }

              const def = customizedBuiltIn ? is : localName;

              if (window.customElements.get(def)) {
                break;
              }

              const getConstructor = cnstrct => {
                const baseClass = options && options.extends ? doc.createElement(options.extends).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : window.HTMLElement;
                /**
                 * Class wrapping base class.
                 */

                return cnstrct ? class extends baseClass {
                  /**
                   * Calls user constructor.
                   */
                  constructor() {
                    super();
                    cnstrct.call(this);
                  }

                } : class extends baseClass {};
              };

              let cnstrctr, options, mixin;

              if (Array.isArray(attVal)) {
                if (attVal.length <= 2) {
                  [cnstrctr, options] = attVal;

                  if (typeof options === 'string') {
                    // Todo: Allow creating a definition without using it;
                    //  that may be the only reason to have a string here which
                    //  differs from the `localName` anyways
                    options = {
                      extends: options
                    };
                  } else if (options && !{}.hasOwnProperty.call(options, 'extends')) {
                    mixin = options;
                  }

                  if (typeof cnstrctr === 'object') {
                    mixin = cnstrctr;
                    cnstrctr = getConstructor();
                  }
                } else {
                  [cnstrctr, mixin, options] = attVal;

                  if (typeof options === 'string') {
                    options = {
                      extends: options
                    };
                  }
                }
              } else if (typeof attVal === 'function') {
                cnstrctr = attVal;
              } else {
                mixin = attVal;
                cnstrctr = getConstructor();
              }

              if (!cnstrctr.toString().startsWith('class')) {
                cnstrctr = getConstructor(cnstrctr);
              }

              if (!options && customizedBuiltIn) {
                options = {
                  extends: localName
                };
              }

              if (mixin) {
                Object.entries(mixin).forEach(([methodName, method]) => {
                  cnstrctr.prototype[methodName] = method;
                });
              } // console.log('def', def, '::', typeof options === 'object' ? options : undefined);


              window.customElements.define(def, cnstrctr, typeof options === 'object' ? options : undefined);
              break;
            }

          case '$symbol':
            {
              const [symbol, func] = attVal;

              if (typeof func === 'function') {
                const funcBound = func.bind(elem);

                if (typeof symbol === 'string') {
                  elem[Symbol.for(symbol)] = funcBound;
                } else {
                  elem[symbol] = funcBound;
                }
              } else {
                const obj = func;
                obj.elem = elem;

                if (typeof symbol === 'string') {
                  elem[Symbol.for(symbol)] = obj;
                } else {
                  elem[symbol] = obj;
                }
              }

              break;
            }

          case '$data':
            {
              setMap(attVal);
              break;
            }

          case '$attribute':
            {
              // Attribute node
              const node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
              node.value = attVal[attVal.length - 1];
              nodes[nodes.length] = node;
              break;
            }

          case '$text':
            {
              // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
              const node = doc.createTextNode(attVal);
              nodes[nodes.length] = node;
              break;
            }

          case '$document':
            {
              // Todo: Conditionally create XML document
              const node = doc.implementation.createHTMLDocument();

              if (attVal.childNodes) {
                // Remove any extra nodes created by createHTMLDocument().
                const j = attVal.childNodes.length;

                while (node.childNodes[j]) {
                  const cn = node.childNodes[j];
                  cn.remove(); // `j` should stay the same as removing will cause node to be present
                }

                attVal.childNodes.forEach(_childrenToJML(node));
              } else {
                if (attVal.$DOCTYPE) {
                  const dt = {
                    $DOCTYPE: attVal.$DOCTYPE
                  };
                  const doctype = jml(dt);
                  node.firstChild.replaceWith(doctype);
                }

                const html = node.childNodes[1];
                const head = html.childNodes[0];
                const body = html.childNodes[1];

                if (attVal.title || attVal.head) {
                  const meta = doc.createElement('meta');
                  meta.setAttribute('charset', 'utf-8');
                  head.append(meta);

                  if (attVal.title) {
                    node.title = attVal.title; // Appends after meta
                  }

                  if (attVal.head) {
                    attVal.head.forEach(_appendJML(head));
                  }
                }

                if (attVal.body) {
                  attVal.body.forEach(_appendJMLOrText(body));
                }
              }

              nodes[nodes.length] = node;
              break;
            }

          case '$DOCTYPE':
            {
              const node = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');
              nodes[nodes.length] = node;
              break;
            }

          case '$on':
            {
              // Events
              // Allow for no-op by defaulting to `{}`
              for (let [p2, val] of Object.entries(attVal || {})) {
                if (typeof val === 'function') {
                  val = [val, false];
                }

                if (typeof val[0] !== 'function') {
                  throw new TypeError(`Expect a function for \`$on\`; args: ${JSON.stringify(args)}`);
                }

                _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing

              }

              break;
            }

          case 'className':
          case 'class':
            attVal = checkPluginValue(elem, att, attVal, opts);

            if (!_isNullish(attVal)) {
              elem.className = attVal;
            }

            break;

          case 'dataset':
            {
              // Map can be keyed with hyphenated or camel-cased properties
              const recurse = (atVal, startProp) => {
                let prop = '';
                const pastInitialProp = startProp !== '';
                Object.keys(atVal).forEach(key => {
                  const value = atVal[key];
                  prop = pastInitialProp ? startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/u, _upperCase) : startProp + key.replace(hyphenForCamelCase, _upperCase);

                  if (value === null || typeof value !== 'object') {
                    if (!_isNullish(value)) {
                      elem.dataset[prop] = value;
                    }

                    prop = startProp;
                    return;
                  }

                  recurse(value, prop);
                });
              };

              recurse(attVal, '');
              break; // Todo: Disable this by default unless configuration explicitly allows (for security)
            }
          // #if IS_REMOVE
          // Don't remove this `if` block (for sake of no-innerHTML build)

          case 'innerHTML':
            if (!_isNullish(attVal)) {
              // eslint-disable-next-line no-unsanitized/property
              elem.innerHTML = attVal;
            }

            break;
          // #endif

          case 'htmlFor':
          case 'for':
            if (elStr === 'label') {
              attVal = checkPluginValue(elem, att, attVal, opts);

              if (!_isNullish(attVal)) {
                elem.htmlFor = attVal;
              }

              break;
            }

            attVal = checkPluginValue(elem, att, attVal, opts);
            elem.setAttribute(att, attVal);
            break;

          case 'xmlns':
            // Already handled
            break;

          default:
            {
              if (att.startsWith('on')) {
                attVal = checkPluginValue(elem, att, attVal, opts);
                elem[att] = attVal; // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event

                break;
              }

              if (att === 'style') {
                attVal = checkPluginValue(elem, att, attVal, opts);

                if (_isNullish(attVal)) {
                  break;
                }

                if (typeof attVal === 'object') {
                  for (const [p2, styleVal] of Object.entries(attVal)) {
                    if (!_isNullish(styleVal)) {
                      // Todo: Handle aggregate properties like "border"
                      if (p2 === 'float') {
                        elem.style.cssFloat = styleVal;
                        elem.style.styleFloat = styleVal; // Harmless though we could make conditional on older IE instead
                      } else {
                        elem.style[p2.replace(hyphenForCamelCase, _upperCase)] = styleVal;
                      }
                    }
                  }

                  break;
                } // setAttribute unfortunately erases any existing styles


                elem.setAttribute(att, attVal);
                /*
                // The following reorders which is troublesome for serialization, e.g., as used in our testing
                if (elem.style.cssText !== undefined) {
                  elem.style.cssText += attVal;
                } else { // Opera
                  elem.style += attVal;
                }
                */

                break;
              }

              const matchingPlugin = getMatchingPlugin(opts, att);

              if (matchingPlugin) {
                matchingPlugin.set({
                  opts,
                  element: elem,
                  attribute: {
                    name: att,
                    value: attVal
                  }
                });
                break;
              }

              attVal = checkPluginValue(elem, att, attVal, opts);
              elem.setAttribute(att, attVal);
              break;
            }
        }
      }
    }

    const nodes = [];
    let elStr;
    let opts;
    let isRoot = false;

    if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(key => possibleOptions.includes(key))) {
      opts = args[0];

      if (opts.$state === undefined) {
        isRoot = true;
        opts.$state = 'root';
      }

      if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
        opts.$map = {
          root: opts.$map
        };
      }

      if ('$plugins' in opts) {
        if (!Array.isArray(opts.$plugins)) {
          throw new TypeError(`\`$plugins\` must be an array; args: ${JSON.stringify(args)}`);
        }

        opts.$plugins.forEach(pluginObj => {
          if (!pluginObj || typeof pluginObj !== 'object') {
            throw new TypeError(`Plugin must be an object; args: ${JSON.stringify(args)}`);
          }

          if (!pluginObj.name || !pluginObj.name.startsWith('$_')) {
            throw new TypeError(`Plugin object name must be present and begin with \`$_\`; args: ${JSON.stringify(args)}`);
          }

          if (typeof pluginObj.set !== 'function') {
            throw new TypeError(`Plugin object must have a \`set\` method; args: ${JSON.stringify(args)}`);
          }
        });
      }

      args = args.slice(1);
    } else {
      opts = {
        $state: undefined
      };
    }

    const argc = args.length;
    const defaultMap = opts.$map && opts.$map.root;

    const setMap = dataVal => {
      let map, obj; // Boolean indicating use of default map and object

      if (dataVal === true) {
        [map, obj] = defaultMap;
      } else if (Array.isArray(dataVal)) {
        // Array of strings mapping to default
        if (typeof dataVal[0] === 'string') {
          dataVal.forEach(dVal => {
            setMap(opts.$map[dVal]);
          });
          return; // Array of Map and non-map data object
        }

        map = dataVal[0] || defaultMap[0];
        obj = dataVal[1] || defaultMap[1]; // Map
      } else if (/^\[object (?:Weak)?Map\]$/u.test([].toString.call(dataVal))) {
        map = dataVal;
        obj = defaultMap[1]; // Non-map data object
      } else {
        map = defaultMap[0];
        obj = dataVal;
      }

      map.set(elem, obj);
    };

    for (let i = 0; i < argc; i++) {
      let arg = args[i];

      const type = _getType(arg);

      switch (type) {
        case 'null':
          // null always indicates a place-holder (only needed for last argument if want array returned)
          if (i === argc - 1) {
            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            // Todo: Fix to allow application of stylesheets of style tags within fragments?


            return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-array-callback-reference
            : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
          }

          throw new TypeError(`\`null\` values not allowed except as final Jamilih argument; index ${i} on args: ${JSON.stringify(args)}`);

        case 'string':
          // Strings normally indicate elements
          switch (arg) {
            case '!':
              nodes[nodes.length] = doc.createComment(args[++i]);
              break;

            case '?':
              {
                arg = args[++i];
                let procValue = args[++i];
                const val = procValue;

                if (val && typeof val === 'object') {
                  procValue = [];

                  for (const [p, procInstVal] of Object.entries(val)) {
                    procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                    procInstVal.replace(/"/gu, '&quot;') + '"');
                  }

                  procValue = procValue.join(' ');
                } // Firefox allows instructions with ">" in this method, but not if placed directly!


                try {
                  nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
                } catch (e) {
                  // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                  // innerHTML didn't work
                  // var elContainer = doc.createElement('div');
                  // elContainer.innerHTML = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                  // nodes[nodes.length] = elContainer.innerHTML;
                  // Todo: any other way to resolve? Just use XML?
                  nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
                }

                break; // Browsers don't support doc.createEntityReference, so we just use this as a convenience
              }

            case '&':
              nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
              break;

            case '#':
              // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
              nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
              break;

            case '#x':
              // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
              nodes[nodes.length] = _createSafeReference('hexadecimal', arg, args[++i]);
              break;

            case '![':
              // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
              // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
              // Todo: config (or detection via some kind of doc.documentType property?) of whether in XML
              try {
                nodes[nodes.length] = doc.createCDATASection(args[++i]);
              } catch (e2) {
                nodes[nodes.length] = doc.createTextNode(args[i]); // i already incremented
              }

              break;

            case '':
              nodes[nodes.length] = elem = doc.createDocumentFragment(); // Todo: Report to plugins

              opts.$state = 'fragment';
              break;

            default:
              {
                // An element
                elStr = arg;
                const atts = args[i + 1];

                if (_getType(atts) === 'object' && atts.is) {
                  const {
                    is
                  } = atts; // istanbul ignore next

                  elem = doc.createElementNS ? doc.createElementNS(NS_HTML, elStr, {
                    is
                  }) : doc.createElement(elStr, {
                    is
                  });
                } else
                  /* istanbul ignore else */
                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr);
                  } else {
                    elem = doc.createElement(elStr);
                  } // Todo: Report to plugins


                opts.$state = 'element';
                nodes[nodes.length] = elem; // Add to parent

                break;
              }
          }

          break;

        case 'object':
          {
            // Non-DOM-element objects indicate attribute-value pairs
            const atts = arg;

            if (atts.xmlns !== undefined) {
              // We handle this here, as otherwise may lose events, etc.
              // As namespace of element already set as XHTML, we need to change the namespace
              // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
              // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
              const replacer = typeof atts.xmlns === 'object' ? _replaceDefiner(atts.xmlns) : ' xmlns="' + atts.xmlns + '"'; // try {
              // Also fix DOMParser to work with text/html

              elem = nodes[nodes.length - 1] = new win.DOMParser().parseFromString(new win.XMLSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
              .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // Todo: Report to plugins

              opts.$state = 'element'; // }catch(e) {alert(elem.outerHTML);throw e;}
            }

            _checkAtts(atts);

            break;
          }

        case 'document':
        case 'fragment':
        case 'element':
          /*
          1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
          2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
          */
          if (i === 0) {
            // Allow wrapping of element, fragment, or document
            elem = arg; // Todo: Report to plugins

            opts.$state = 'element';
          }

          if (i === argc - 1 || i === argc - 2 && args[i + 1] === null) {
            // parent
            const elsl = nodes.length;

            for (let k = 0; k < elsl; k++) {
              _appendNode(arg, nodes[k]);
            } // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?


            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them

          } else {
            nodes[nodes.length] = arg;
          }

          break;

        case 'array':
          {
            // Arrays or arrays of arrays indicate child nodes
            const child = arg;
            const cl = child.length;

            for (let j = 0; j < cl; j++) {
              // Go through children array container to handle elements
              const childContent = child[j];
              const childContentType = typeof childContent;

              if (_isNullish(childContent)) {
                throw new TypeError(`Bad children (parent array: ${JSON.stringify(args)}; index ${j} of child: ${JSON.stringify(child)})`);
              }

              switch (childContentType) {
                // Todo: determine whether null or function should have special handling or be converted to text
                case 'string':
                case 'number':
                case 'boolean':
                  _appendNode(elem, doc.createTextNode(childContent));

                  break;

                default:
                  if (Array.isArray(childContent)) {
                    // Arrays representing child elements
                    opts.$state = 'children';

                    _appendNode(elem, jml(opts, ...childContent));
                  } else if (childContent['#']) {
                    // Fragment
                    opts.$state = 'fragmentChildren';

                    _appendNode(elem, jml(opts, childContent['#']));
                  } else {
                    // Single DOM element children
                    const newChildContent = checkPluginValue(elem, null, childContent, opts);

                    _appendNode(elem, newChildContent);
                  }

                  break;
              }
            }

            break;
          }

        default:
          throw new TypeError(`Unexpected type: ${type}; arg: ${arg}; index ${i} on args: ${JSON.stringify(args)}`);
      }
    }

    const ret = nodes[0] || elem;

    if (isRoot && opts.$map && opts.$map.root) {
      setMap(true);
    }

    return ret;
  };
  /**
  * Converts a DOM object or a string of HTML into a Jamilih object (or string).
  * @param {string|HTMLElement} dom If a string, will parse as document
  * @param {PlainObject} [config] Configuration object
  * @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
  * @param {boolean} [config.reportInvalidState=true] If true (the default), will report invalid state errors
  * @param {boolean} [config.stripWhitespace=false] Strip whitespace for text nodes
  * @throws {TypeError}
  * @returns {JamilihArray|string} Array containing the elements which represent
  * a Jamilih object, or, if `stringOutput` is true, it will be the stringified
  * version of such an object
  */


  jml.toJML = function (dom, {
    stringOutput = false,
    reportInvalidState = true,
    stripWhitespace = false
  } = {}) {
    if (typeof dom === 'string') {
      dom = new win.DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    const ret = [];
    let parent = ret;
    let parentIdx = 0;
    /**
     * @param {string} msg
     * @throws {DOMException}
     * @returns {void}
     */

    function invalidStateError(msg) {
      // These are probably only necessary if working with text/html

      /* eslint-disable no-shadow, unicorn/custom-error-definition */

      /**
       * Polyfill for `DOMException`.
       */
      class DOMException extends Error {
        /* eslint-enable no-shadow, unicorn/custom-error-definition */

        /**
         * @param {string} message
         * @param {string} name
         */
        constructor(message, name) {
          super(message); // eslint-disable-next-line unicorn/custom-error-definition

          this.name = name;
        }

      }

      if (reportInvalidState) {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        const e = new DOMException(msg, 'INVALID_STATE_ERR');
        e.code = 11;
        throw e;
      }
    }
    /**
     *
     * @param {DocumentType|Entity} obj
     * @param {Node} node
     * @returns {void}
     */


    function addExternalID(obj, node) {
      if (node.systemId.includes('"') && node.systemId.includes("'")) {
        invalidStateError('systemId cannot have both single and double quotes.');
      }

      const {
        publicId,
        systemId
      } = node;

      if (systemId) {
        obj.systemId = systemId;
      }

      if (publicId) {
        obj.publicId = publicId;
      }
    }
    /**
     *
     * @param {any} val
     * @returns {void}
     */


    function set(val) {
      parent[parentIdx] = val;
      parentIdx++;
    }
    /**
     * @returns {void}
     */


    function setChildren() {
      set([]);
      parent = parent[parentIdx - 1];
      parentIdx = 0;
    }
    /**
     *
     * @param {string} prop1
     * @param {string} prop2
     * @returns {void}
     */


    function setObj(prop1, prop2) {
      parent = parent[parentIdx - 1][prop1];
      parentIdx = 0;

      if (prop2) {
        parent = parent[prop2];
      }
    }
    /**
     *
     * @param {Node} node
     * @param {object<{string: string}>} namespaces
     * @throws {TypeError}
     * @returns {void}
     */


    function parseDOM(node, namespaces) {
      // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

      /*
      if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
        invalidStateError('Prefix cannot have a colon');
      }
      */
      const type = 'nodeType' in node ? node.nodeType : null;
      namespaces = { ...namespaces
      };
      const xmlChars = /^([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/u; // eslint-disable-line no-control-regex

      if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
        invalidStateError('Node has bad XML character value');
      }

      let tmpParent, tmpParentIdx;
      /**
       * @returns {void}
       */

      function setTemp() {
        tmpParent = parent;
        tmpParentIdx = parentIdx;
      }
      /**
       * @returns {void}
       */


      function resetTemp() {
        parent = tmpParent;
        parentIdx = tmpParentIdx;
        parentIdx++; // Increment index in parent container of this element
      }

      switch (type) {
        case 1:
          {
            // ELEMENT
            setTemp();
            const nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays

            set(nodeName);
            const start = {};
            let hasNamespaceDeclaration = false;

            if (namespaces[node.prefix || ''] !== node.namespaceURI) {
              namespaces[node.prefix || ''] = node.namespaceURI;

              if (node.prefix) {
                start['xmlns:' + node.prefix] = node.namespaceURI;
              } else if (node.namespaceURI) {
                start.xmlns = node.namespaceURI;
              } else {
                start.xmlns = null;
              }

              hasNamespaceDeclaration = true;
            }

            if (node.attributes.length) {
              set([...node.attributes].reduce(function (obj, att) {
                obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

                return obj;
              }, start));
            } else if (hasNamespaceDeclaration) {
              set(start);
            }

            const {
              childNodes
            } = node;

            if (childNodes.length) {
              setChildren(); // Element children array container

              [...childNodes].forEach(function (childNode) {
                parseDOM(childNode, namespaces);
              });
            }

            resetTemp();
            break;
          }

        case undefined: // Treat as attribute node until this is fixed: https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822

        case 2:
          // ATTRIBUTE (should only get here if passing in an attribute node)
          set({
            $attribute: [node.namespaceURI, node.name, node.value]
          });
          break;

        case 3:
          // TEXT
          if (stripWhitespace && /^\s+$/u.test(node.nodeValue)) {
            set('');
            return;
          }

          set(node.nodeValue);
          break;

        case 4:
          // CDATA
          if (node.nodeValue.includes(']]' + '>')) {
            invalidStateError('CDATA cannot end with closing ]]>');
          }

          set(['![', node.nodeValue]);
          break;

        case 5:
          // ENTITY REFERENCE (though not in browsers (was already resolved
          //  anyways), ok to keep for parity with our "entity" shorthand)
          set(['&', node.nodeName]);
          break;

        case 7:
          // PROCESSING INSTRUCTION
          if (/^xml$/iu.test(node.target)) {
            invalidStateError('Processing instructions cannot be "xml".');
          }

          if (node.target.includes('?>')) {
            invalidStateError('Processing instruction targets cannot include ?>');
          }

          if (node.target.includes(':')) {
            invalidStateError('The processing instruction target cannot include ":"');
          }

          if (node.data.includes('?>')) {
            invalidStateError('Processing instruction data cannot include ?>');
          }

          set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes

          break;

        case 8:
          // COMMENT
          if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
            invalidStateError('Comments cannot include --');
          }

          set(['!', node.nodeValue]);
          break;

        case 9:
          {
            // DOCUMENT
            setTemp();
            const docObj = {
              $document: {
                childNodes: []
              }
            };
            set(docObj); // doc.implementation.createHTMLDocument
            // Set position to fragment's array children

            setObj('$document', 'childNodes');
            const {
              childNodes
            } = node;

            if (!childNodes.length) {
              invalidStateError('Documents must have a child node');
            } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


            [...childNodes].forEach(function (childNode) {
              // Can't just do documentElement as there may be doctype, comments, etc.
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });
            resetTemp();
            break;
          }

        case 10:
          {
            // DOCUMENT TYPE
            setTemp(); // Can create directly by doc.implementation.createDocumentType

            const start = {
              $DOCTYPE: {
                name: node.name
              }
            };
            const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u; // eslint-disable-line no-control-regex

            if (!pubIdChar.test(node.publicId)) {
              invalidStateError('A publicId must have valid characters.');
            }

            addExternalID(start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

            set(start); // Auto-generate the internalSubset instead?

            resetTemp();
            break;
          }

        case 11:
          {
            // DOCUMENT FRAGMENT
            setTemp();
            set({
              '#': []
            }); // Set position to fragment's array children

            setObj('#');
            const {
              childNodes
            } = node;
            [...childNodes].forEach(function (childNode) {
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });
            resetTemp();
            break;
          }

        default:
          throw new TypeError('Not an XML type');
      }
    }

    parseDOM(dom, {});

    if (stringOutput) {
      return JSON.stringify(ret[0]);
    }

    return ret[0];
  };

  jml.toJMLString = function (dom, config) {
    return jml.toJML(dom, Object.assign(config || {}, {
      stringOutput: true
    }));
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {JamilihReturn}
   */


  jml.toDOM = function (...args) {
    // Alias for jml()
    return jml(...args);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toHTML = function (...args) {
    // Todo: Replace this with version of jml() that directly builds a string
    const ret = jml(...args); // Todo: deal with serialization of properties like 'selected',
    //  'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*',
    //  'style'! (i.e., need to build a string ourselves)

    return ret.outerHTML;
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toDOMString = function (...args) {
    // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML(...args);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXML = function (...args) {
    const ret = jml(...args);
    return new win.XMLSerializer().serializeToString(ret);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXMLDOMString = function (...args) {
    // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML(...args);
  };
  /**
   * Element-aware wrapper for `Map`.
   */


  class JamilihMap extends Map {
    /**
     * @param {string|Element} elem
     * @returns {any}
     */
    get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.get.call(this, elem);
    }
    /**
     * @param {string|Element} elem
     * @param {any} value
     * @returns {any}
     */


    set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.set.call(this, elem, value);
    }
    /**
     * @param {string|Element} elem
     * @param {string} methodName
     * @param {...any} args
     * @returns {any}
     */


    invoke(elem, methodName, ...args) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return this.get(elem)[methodName](elem, ...args);
    }

  }
  /**
   * Element-aware wrapper for `WeakMap`.
   */


  class JamilihWeakMap extends WeakMap {
    /**
     * @param {string|Element} elem
     * @returns {any}
     */
    get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.get.call(this, elem);
    }
    /**
     * @param {string|Element} elem
     * @param {any} value
     * @returns {any}
     */


    set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return super.set.call(this, elem, value);
    }
    /**
     * @param {string|Element} elem
     * @param {string} methodName
     * @param {...any} args
     * @returns {any}
     */


    invoke(elem, methodName, ...args) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return this.get(elem)[methodName](elem, ...args);
    }

  }

  jml.Map = JamilihMap;
  jml.WeakMap = JamilihWeakMap;
  /**
  * @typedef {GenericArray} MapAndElementArray
  * @property {JamilihWeakMap|JamilihMap} 0
  * @property {Element} 1
  */

  /**
   * @param {GenericObject} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */

  jml.weak = function (obj, ...args) {
    const map = new JamilihWeakMap();
    const elem = jml({
      $map: [map, obj]
    }, ...args);
    return [map, elem];
  };
  /**
   * @param {any} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */


  jml.strong = function (obj, ...args) {
    const map = new JamilihMap();
    const elem = jml({
      $map: [map, obj]
    }, ...args);
    return [map, elem];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string} sym If a string, will be used with `Symbol.for`
   * @returns {any} The value associated with the symbol
   */


  jml.symbol = jml.sym = jml.for = function (elem, sym) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string|Map|WeakMap} symOrMap If a string, will be used with `Symbol.for`
   * @param {string|any} methodName Can be `any` if the symbol or map directly
   *   points to a function (it is then used as the first argument).
   * @param {any[]} args
   * @returns {any}
   */


  jml.command = function (elem, symOrMap, methodName, ...args) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    let func;

    if (['symbol', 'string'].includes(typeof symOrMap)) {
      func = jml.sym(elem, symOrMap);

      if (typeof func === 'function') {
        return func(methodName, ...args); // Already has `this` bound to `elem`
      }

      return func[methodName](...args);
    }

    func = symOrMap.get(elem);

    if (typeof func === 'function') {
      return func.call(elem, methodName, ...args);
    }

    return func[methodName](elem, ...args); // return func[methodName].call(elem, ...args);
  };
  /**
   * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
   * Also updates `body` with `document.body`.
   * @param {Window} wind
   * @returns {void}
   */


  jml.setWindow = wind => {
    win = wind;
    doc = win.document;

    if (doc && doc.body) {
      ({
        body
      } = doc);
    }
  };
  /**
   * @returns {Window}
   */


  jml.getWindow = () => {
    return win;
  };


  let body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

  const nbsp = '\u00A0'; // Very commonly needed in templates

  const findImageRegionBar = ({
    getJSON, prefs
  }) => {
    return jml('find-image-region-bar', {
      // Point to our selector (could be a more precise selector)
      textImageMap: 'text-image-map',
      $on: {
        'get-form-object' (e) {
          e.detail($('serialized-json').getJSON());
        },
        async 'use-view-mode' (e) {
          e.detail((await prefs.getPref('mode')) === 'view');
        }
      }
    }, body);
  };

  const empty$1 = (el) => {
    while (el.firstChild) {
      el.firstChild.remove();
    }
  };

  const timeout = (delay) => {
    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay || 0);
    });
  };

  const nbsp2$4 = nbsp.repeat(2);

  const formControlsRect = ({currentImageRegionID, outputArea}) => {
    return jml('div', [
      ['label', [
        _('Left x'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_leftx`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]], nbsp2$4,
      ['label', [
        _('Top y'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_topy`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]], nbsp2$4,
      ['label', [
        _('Right x'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_rightx`,
          type: 'number', size: 5, required: true, value: 300
        }]
      ]], nbsp2$4,
      ['label', [
        _('Bottom y'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_bottomy`,
          type: 'number', size: 5, required: true, value: 300
        }]
      ]], nbsp2$4
    ], outputArea);
  };

  const nbsp2$3 = nbsp.repeat(2);

  const formControlsCircle = ({currentImageRegionID, outputArea}) => {
    return jml('div', [
      ['label', [
        _('x'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_circlex`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]], nbsp2$3,
      ['label', [
        _('y'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_circley`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]], nbsp2$3,
      ['label', [
        _('r'),
        nbsp,
        ['input', {
          name: `${currentImageRegionID}_circler`,
          type: 'number', size: 5, required: true, value: 30
        }]
      ]]
    ], outputArea);
  };

  const nbsp2$2 = nbsp.repeat(2);

  const makeFrom = () => {
    return ['span', {class: 'from'}, [_('From:')]];
  };
  const makeTo = () => ['span', [_('To:')]];

  /**
   * @param {Integer} currImageRegionID
   * @param {boolean} from
   * @returns {HTMLDivElement}
   */
  function editPolyXY (currImageRegionID, from = false) {
    /**
     * @param {Event} e
     * @returns {void}
     */
    function addPolyClick (e) {
      e.preventDefault();
      polyDiv.after(editPolyXY(currImageRegionID));
    }
    /**
     * @param {Event} e
     * @returns {void}
     */
    function removePolyClick (e) {
      e.preventDefault();
      const buttonSets = polyDiv.parentElement;
      if (buttonSets.children.length <= 2) {
        return;
      }
      polyDiv.remove();
      const firstButtonSet = buttonSets.firstElementChild;
      const fromOrTo = firstButtonSet.firstElementChild;
      if (fromOrTo.className !== 'from') {
        fromOrTo.replaceWith(jml(...makeFrom()));
      }
    }

    const polyDiv = jml('div', [
      from
        ? makeFrom()
        : makeTo(),
      nbsp2$2,
      ['label', [
        _('x'),
        nbsp,
        ['input', {
          name: `${currImageRegionID}_xy`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]], nbsp2$2,
      ['label', [
        _('y'),
        nbsp,
        ['input', {
          name: `${currImageRegionID}_xy`,
          type: 'number', size: 5, required: true, value: 1
        }]
      ]],
      nbsp2$2,
      ['button', {class: 'addPoly', $on: {
        click: addPolyClick
      }}, [
        '+'
      ]],
      ['button', {class: 'removePoly', $on: {
        click: removePolyClick
      }}, [
        '-'
      ]]
    ]);
    return polyDiv;
  }

  const formControlsPoly = ({
    outputArea, currentImageRegionID
  }) => {
    return jml('div', {class: 'polyDivHolder'}, [
      editPolyXY(currentImageRegionID, true)
    ], outputArea);
  };

  const nbsp2$1 = nbsp.repeat(2);

  const formText = ({
    formShapeSelection,
    currentImageRegionID, outputArea,
    requireText, prefs, li
  }) => {
    /**
     * @param {Event} e
     * @returns {void}
     */
    function addImageRegionClick (e) {
      e.preventDefault();
      formShapeSelection({
        requireText,
        prevElement: li,
        prefs
      });
    }
    /**
     * @param {Event} e
     * @returns {void}
     */
    function removeImageRegionClick (e) {
      e.preventDefault();
      const imageRegions = $$1('#imageRegions');
      if (imageRegions.children.length === 1) {
        return;
      }
      li.remove();
    }
    return jml('div', [
      ['div', [
        ['label', [
          _('Text'), nbsp2$1,
          ['textarea', {
            class: 'requireText',
            name: `${currentImageRegionID}_text`,
            required: requireText
          }]
        ]]
      ]],
      ['button', {class: 'addRegion', dataset: {
        regionId: currentImageRegionID
      }, $on: {
        click: addImageRegionClick
      }}, [
        _('+')
      ]],
      ['button', {class: 'removeRegion', dataset: {
        regionId: currentImageRegionID
      }, $on: {
        click: removeImageRegionClick
      }}, [
        _('-')
      ]],
      ['br'],
      ['br']
    ], outputArea);
  };

  // Todo: Make this an instance of this element
  let imgRegionID = 0;

  /**
  * @param {Integer} imageRegionID
  * @returns {void}
  */
  function setImageRegionID (imageRegionID) {
    imgRegionID = imageRegionID;
  }

  let requireText$1;
  /**
   * @param {string} reqText
   * @returns {void}
   */
  function setRequireText$1 (reqText) {
    requireText$1 = reqText;
  }

  /**
   * @param {PlainObject} cfg
   * @param {Integer} cfg.imageRegionID
   * @param {HTMLElement} cfg.prevElement
   * @param {SimplePrefs} cfg.prefs
   * @returns {void}
   */
  function formShapeSelection ({
    imageRegionID = imgRegionID++, prevElement, prefs
  }) {
    const currentImageRegionID = imageRegionID;

    /**
    * @param {Event} e
    * @returns {void}
    */
    function shapeSelectionChange ({target}) {
      const outputArea = this.nextElementSibling;
      empty$1(outputArea);
      switch (target.value) {
      case 'rect':
        formControlsRect({currentImageRegionID, outputArea});
        break;
      case 'circle':
        formControlsCircle({currentImageRegionID, outputArea});
        break;
      case 'poly': {
        const div = formControlsPoly({
          outputArea,
          currentImageRegionID
        });
        div.querySelector('button.addPoly').click();
        break;
      }    }
      formText({
        formShapeSelection,
        prefs,
        li,
        requireText: requireText$1,
        currentImageRegionID,
        outputArea
      });
    }

    const li = jml('li', [
      ['select', {
        name: `${currentImageRegionID}_shape`,
        'aria-label': _('Shape'),
        $on: {change: shapeSelectionChange}
      }, [
        ['option', {value: 'rect'}, [_('Rectangle')]],
        ['option', {value: 'circle'}, [_('Circle')]],
        // Todo: Disable after testing!
        // Todo: https://github.com/naver/image-maps/issues/9
        ['option', {value: 'poly'}, [_('Polygon')]]
      ]],
      ['div']
    ]);

    if (prevElement) {
      prevElement.after(li);
    } else {
      jml(li, $('#imageRegions'));
    }
    li.firstElementChild.dispatchEvent(new Event('change'));
  }

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _slicedToArray$2(arr, i) {
    return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest$2();
  }

  function _toConsumableArray$2(arr) {
    return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$2();
  }

  function _arrayWithoutHoles$2(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$2(arr);
  }

  function _arrayWithHoles$2(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$2(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit$2(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray$2(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen);
  }

  function _arrayLikeToArray$2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread$2() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest$2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /**
   *
   * Get successful control from form and assemble into object.
   * @see {@link http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2}
   * @module FormSerialization
   */
  // types which indicate a submit action and are not successful controls
  // these will be ignored
  var kRSubmitter = /^(?:submit|button|image|reset|file)$/i; // node names which could be successful controls

  var kRSuccessContrls = /^(?:input|select|textarea|keygen)/i; // Matches bracket notation.

  var brackets = /(\[[^[\]]*])/g;
  /**
   * @callback module:FormSerialization.Serializer
   * @param {PlainObject|string|any} result
   * @param {string} key
   * @param {string} value
   * @returns {PlainObject|string|any} New result
  */

  /**
   * @typedef {PlainObject} module:FormSerialization.Options
   * @property {boolean} [hash] Configure the output type. If true, the
   *  output will be a JavaScript object.
   * @property {module:FormSerialization.Serializer} [serializer] Optional
   *   serializer function to override the default one. Otherwise, hash
   *   and URL-encoded string serializers are provided with this module,
   *   depending on the setting of `hash`.
   * @property {boolean} [disabled] If true serialize disabled fields.
   * @property {boolean} [empty] If true serialize empty fields
  */

  /**
   * Serializes form fields.
   * @function module:FormSerialization.serialize
   * @param {HTMLFormElement} form MUST be an `HTMLFormElement`
   * @param {module:FormSerialization.Options} options is an optional argument
   *   to configure the serialization.
   * @returns {any|string|PlainObject} Default output with no options specified is
   *   a url encoded string
   */

  function serialize(form, options) {
    if (_typeof$1(options) !== 'object') {
      options = {
        hash: Boolean(options)
      };
    } else if (options.hash === undefined) {
      options.hash = true;
    }

    var result = options.hash ? {} : '';
    var serializer = options.serializer || (options.hash ? hashSerializer : strSerialize);
    var elements = form && form.elements ? _toConsumableArray$2(form.elements) : []; // Object store each radio and set if it's empty or not

    var radioStore = Object.create(null);
    elements.forEach(function (element) {
      // ignore disabled fields
      if (!options.disabled && element.disabled || !element.name) {
        return;
      } // ignore anything that is not considered a success field


      if (!kRSuccessContrls.test(element.nodeName) || kRSubmitter.test(element.type)) {
        return;
      }

      var key = element.name,
          type = element.type,
          name = element.name,
          checked = element.checked;
      var value = element.value; // We can't just use element.value for checkboxes cause some
      //   browsers lie to us; they say "on" for value when the
      //   box isn't checked

      if ((type === 'checkbox' || type === 'radio') && !checked) {
        value = undefined;
      } // If we want empty elements


      if (options.empty) {
        // for checkbox
        if (type === 'checkbox' && !checked) {
          value = '';
        } // for radio


        if (type === 'radio') {
          if (!radioStore[name] && !checked) {
            radioStore[name] = false;
          } else if (checked) {
            radioStore[name] = true;
          }

          if (value === undefined) {
            return;
          }
        }
      } else if (!value) {
        // value-less fields are ignored unless options.empty is true
        return;
      } // multi select boxes


      if (type === 'select-multiple') {
        var isSelectedOptions = false;

        _toConsumableArray$2(element.options).forEach(function (option) {
          var allowedEmpty = options.empty && !option.value;
          var hasValue = option.value || allowedEmpty;

          if (option.selected && hasValue) {
            isSelectedOptions = true; // If using a hash serializer be sure to add the
            // correct notation for an array in the multi-select
            // context. Here the name attribute on the select element
            // might be missing the trailing bracket pair. Both names
            // "foo" and "foo[]" should be arrays.

            if (options.hash && key.slice(-2) !== '[]') {
              result = serializer(result, key + '[]', option.value);
            } else {
              result = serializer(result, key, option.value);
            }
          }
        }); // Serialize if no selected options and options.empty is true


        if (!isSelectedOptions && options.empty) {
          result = serializer(result, key, '');
        }

        return;
      }

      result = serializer(result, key, value);
    }); // Check for all empty radio buttons and serialize them with key=""

    if (options.empty) {
      Object.entries(radioStore).forEach(function (_ref) {
        var _ref2 = _slicedToArray$2(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        if (!value) {
          result = serializer(result, key, '');
        }
      });
    }

    return result;
  }
  /**
   *
   * @param {string} string
   * @returns {string[]}
   */

  function parseKeys(string) {
    var keys = [];
    var prefix = /^([^[\]]*)/;
    var children = new RegExp(brackets);
    var match = prefix.exec(string);

    if (match[1]) {
      keys.push(match[1]);
    }

    while ((match = children.exec(string)) !== null) {
      keys.push(match[1]);
    }

    return keys;
  }
  /**
  * @typedef {GenericArray} ResultArray
  */

  /**
   *
   * @param {PlainObject|ResultArray} result
   * @param {string[]} keys
   * @param {string} value
   * @returns {string|PlainObject|ResultArray}
   */


  function hashAssign(result, keys, value) {
    if (keys.length === 0) {
      return value;
    }

    var key = keys.shift();
    var between = key.match(/^\[(.+?)]$/);

    if (key === '[]') {
      result = result || [];

      if (Array.isArray(result)) {
        result.push(hashAssign(null, keys, value));
      } else {
        // This might be the result of bad name attributes like "[][foo]",
        // in this case the original `result` object will already be
        // assigned to an object literal. Rather than coerce the object to
        // an array, or cause an exception the attribute "_values" is
        // assigned as an array.
        result._values = result._values || [];

        result._values.push(hashAssign(null, keys, value));
      }

      return result;
    } // Key is an attribute name and can be assigned directly.


    if (!between) {
      result[key] = hashAssign(result[key], keys, value);
    } else {
      var string = between[1]; // +var converts the variable into a number
      // better than parseInt because it doesn't truncate away trailing
      // letters and actually fails if whole thing is not a number

      var index = Number(string); // If the characters between the brackets is not a number it is an
      // attribute name and can be assigned directly.
      // Switching to Number.isNaN would require a polyfill for IE11
      // eslint-disable-next-line unicorn/prefer-number-properties

      if (isNaN(index)) {
        result = result || {};
        result[string] = hashAssign(result[string], keys, value);
      } else {
        result = result || [];
        result[index] = hashAssign(result[index], keys, value);
      }
    }

    return result;
  }
  /**
   * Object/hash encoding serializer.
   * @param {PlainObject} result
   * @param {string} key
   * @param {string} value
   * @returns {PlainObject}
   */


  function hashSerializer(result, key, value) {
    var hasBrackets = key.match(brackets); // Has brackets? Use the recursive assignment function to walk the keys,
    // construct any missing objects in the result tree and make the assignment
    // at the end of the chain.

    if (hasBrackets) {
      var keys = parseKeys(key);
      hashAssign(result, keys, value);
    } else {
      // Non bracket notation can make assignments directly.
      var existing = result[key]; // If the value has been assigned already (for instance when a radio and
      // a checkbox have the same name attribute) convert the previous value
      // into an array before pushing into it.
      //
      // NOTE: If this requirement were removed all hash creation and
      // assignment could go through `hashAssign`.

      if (existing) {
        if (!Array.isArray(existing)) {
          result[key] = [existing];
        }

        result[key].push(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
  /**
   * URL form encoding serializer.
   * @param {string} result
   * @param {string} key
   * @param {string} value
   * @returns {string} New result
   */


  function strSerialize(result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value); // spaces should be '+' rather than '%20'.

    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
  }
  /**
   * @function module:FormSerialization.deserialize
   * @param {HTMLFormElement} form
   * @param {PlainObject} hash
   * @returns {void}
   */


  function deserialize(form, hash) {
    // input(text|radio|checkbox)|select(multiple)|textarea|keygen
    Object.entries(hash).forEach(function (_ref3) {
      var _ref4 = _slicedToArray$2(_ref3, 2),
          name = _ref4[0],
          value = _ref4[1];

      var control = form[name];
      var hasBrackets = false; // istanbul ignore else

      if (!control) {
        // Try again for jsdom
        control = form.querySelector("[name=\"".concat(name, "\"]"));

        if (!control) {
          // We want this for `RadioNodeList` so setting value
          //  auto-disables other boxes
          control = form[name + '[]']; // istanbul ignore next

          if (!control || _typeof$1(control) !== 'object' || !('length' in control)) {
            // The latter query would only get a single
            //  element, so if not a `RadioNodeList`, we get
            //  all values here
            control = form.querySelectorAll("[name=\"".concat(name, "[]\"]"));

            if (!control.length) {
              throw new Error("Name not found ".concat(name));
            }
          }

          hasBrackets = true;
        }
      }

      var _control = control,
          type = _control.type;

      if (type === 'checkbox') {
        control.checked = value !== '';
      }

      if (type === 'radio' || control[0] && control[0].type === 'radio') {
        _toConsumableArray$2(form.querySelectorAll("[name=\"".concat(name + (hasBrackets ? '[]' : ''), "\"]"))).forEach(function (radio) {
          radio.checked = value === radio.value;
        });
      }

      if (control[0] && control[0].type === 'select-multiple') {
        _toConsumableArray$2(control[0].options).forEach(function (o) {
          if (value.includes(o.value)) {
            o.selected = true;
          }
        });

        return;
      }

      if (Array.isArray(value)) {
        // options on a multiple select
        if (type === 'select-multiple') {
          _toConsumableArray$2(control.options).forEach(function (o) {
            if (value.includes(o.value)) {
              o.selected = true;
            }
          });

          return;
        }

        value.forEach(function (v, i) {
          var c = control[i];

          if (c.type === 'checkbox') {
            var isMatch = c.value === v || v === 'on';
            c.checked = isMatch;
            return;
          }

          if (c.type === 'select-multiple') {
            _toConsumableArray$2(c.options).forEach(function (o) {
              if (v.includes(o.value)) {
                o.selected = true;
              }
            });

            return;
          }

          c.value = v;
        });
      } else {
        control.value = value;
      }
    });
  }

  const getFormToImageMap = ({
    prefs, styles,
    setFormObjCoordsAndUpdateViewForMap
  }) => {
    const defaultShapeStyles = styles.cloneStylesOfRuleSelector(
      '.shape-style-defaults'
    );

    // Todo: Move out editable-related code to editable function
    // Move more of this into `text-image-map` itself?
    const formToImageMap = async ({
      textImageMap, formObj, mode, defaultImageSrc
    }) => {
      const {name} = formObj;

      textImageMap.name = name;

      textImageMap.src = /* $('input[name=mapURL]').value */ formObj.mapURL ||
        defaultImageSrc;

      textImageMap.setShapeStrokeFillOptions(defaultShapeStyles);
      textImageMap.setImageMaps({
        formObj,
        mode,
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
      textImageMap.toggleTextDragRectangleByMode(mode);

      // Todo: Should find a better way around this
      // Wait until SVG is built
      await timeout(500);

      // This could have since been modified but not yet saved
      textImageMap.setFormObject(formObj);
      textImageMap.buildImageMapAreasForFormObject();
    };

    const editableFormToImageMap = async ({textImageMap, formObj, mode}) => {
      const defaultImageSrc = await prefs.getPref('lastImageSrc');

      return await formToImageMap({
        textImageMap, formObj, mode,
        defaultImageSrc: defaultImageSrc.startsWith('http')
          ? defaultImageSrc
          : location.href + '/' + defaultImageSrc
      });
    };

    return {
      editableFormToImageMap,
      formToImageMap
    };
  };

  /**
  * @typedef {"circle"|"rect"|"polygon"} ImageDataShape
  */
  /**
  * @param {FormObject} formObj
  * @returns {{shape: ImageDataShape, alt: string, coords: string[]}}
  */
  function imageMapFormObjectInfo (formObj) {
    const formObjKeys = Object.keys(formObj);
    const shapeIDS = formObjKeys.filter((item) => {
      return item.endsWith('_shape');
    });

    return shapeIDS.map((shapeID) => {
      const shape = formObj[shapeID];
      const setNum = shapeID.slice(0, -('_shape'.length));
      const alt = formObj[setNum + '_text'];
      const coords = shape === 'circle'
        ? ['circlex', 'circley', 'circler'].map((item) => {
          return formObj[setNum + '_' + item];
        })
        : shape === 'rect'
          ? ['leftx', 'topy', 'rightx', 'bottomy'].map((item) => {
            return formObj[setNum + '_' + item];
          })
          // Poly
          : formObjKeys.filter((item) => {
            return item.startsWith(setNum) && item.endsWith('_xy');
          }).map((item) => {
            return formObj[item];
          });
      return {shape, alt, coords};
    });
  }

  /*! (c) Andrea Giammarchi - ISC */
  var self$3 = {};
  try { self$3.WeakMap = WeakMap; }
  catch (WeakMap) {
    // this could be better but 90% of the time
    // it's everything developers need as fallback
    self$3.WeakMap = (function (id, Object) {    var dP = Object.defineProperty;
      var hOP = Object.hasOwnProperty;
      var proto = WeakMap.prototype;
      proto.delete = function (key) {
        return this.has(key) && delete key[this._];
      };
      proto.get = function (key) {
        return this.has(key) ? key[this._] : void 0;
      };
      proto.has = function (key) {
        return hOP.call(key, this._);
      };
      proto.set = function (key, value) {
        dP(key, this._, {configurable: true, value: value});
        return this;
      };
      return WeakMap;
      function WeakMap(iterable) {
        dP(this, '_', {value: '_@ungap/weakmap' + id++});
        if (iterable)
          iterable.forEach(add, this);
      }
      function add(pair) {
        this.set(pair[0], pair[1]);
      }
    }(Math.random(), Object));
  }
  var WeakMap$1 = self$3.WeakMap;

  /*! (c) Andrea Giammarchi - ISC */
  var self$2 = {};
  try { self$2.WeakSet = WeakSet; }
  catch (WeakSet) {
    (function (id, dP) {
      var proto = WeakSet.prototype;
      proto.add = function (object) {
        if (!this.has(object))
          dP(object, this._, {value: true, configurable: true});
        return this;
      };
      proto.has = function (object) {
        return this.hasOwnProperty.call(object, this._);
      };
      proto.delete = function (object) {
        return this.has(object) && delete object[this._];
      };
      self$2.WeakSet = WeakSet;
      function WeakSet() {      dP(this, '_', {value: '_@ungap/weakmap' + id++});
      }
    }(Math.random(), Object.defineProperty));
  }
  var WeakSet$1 = self$2.WeakSet;

  const {indexOf: indexOf$1, slice: slice$1} = [];

  const append = (get, parent, children, start, end, before) => {
    const isSelect = 'selectedIndex' in parent;
    let noSelection = isSelect;
    while (start < end) {
      const child = get(children[start], 1);
      parent.insertBefore(child, before);
      if (isSelect && noSelection && child.selected) {
        noSelection = !noSelection;
        let {selectedIndex} = parent;
        parent.selectedIndex = selectedIndex < 0 ?
          start :
          indexOf$1.call(parent.querySelectorAll('option'), child);
      }
      start++;
    }
  };

  const eqeq = (a, b) => a == b;

  const identity = O => O;

  const indexOf = (
    moreNodes,
    moreStart,
    moreEnd,
    lessNodes,
    lessStart,
    lessEnd,
    compare
  ) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */
    if (length < 1)
      return -1;
    while ((moreEnd - moreStart) >= length) {
      let m = moreStart;
      let l = lessStart;
      while (
        m < moreEnd &&
        l < lessEnd &&
        compare(moreNodes[m], lessNodes[l])
      ) {
        m++;
        l++;
      }
      if (l === lessEnd)
        return moreStart;
      moreStart = m + 1;
    }
    return -1;
  };

  const isReversed = (
    futureNodes,
    futureEnd,
    currentNodes,
    currentStart,
    currentEnd,
    compare
  ) => {
    while (
      currentStart < currentEnd &&
      compare(
        currentNodes[currentStart],
        futureNodes[futureEnd - 1]
      )) {
        currentStart++;
        futureEnd--;
      }  return futureEnd === 0;
  };

  const next = (get, list, i, length, before) => i < length ?
                get(list[i], 0) :
                (0 < i ?
                  get(list[i - 1], -0).nextSibling :
                  before);

  const remove = (get, children, start, end) => {
    while (start < end)
      drop(get(children[start++], -1));
  };

  // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges
  ) => {

    let k = 0;
    /* istanbul ignore next */
    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++)
      tresh[i] = currentEnd;

    const nodes = currentNodes.slice(currentStart, currentEnd);

    for (let i = futureStart; i < futureEnd; i++) {
      const index = nodes.indexOf(futureNodes[i]);
      if (-1 < index) {
        const idxInOld = index + currentStart;
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */
        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;
    while (tresh[k] > currentEnd) --k;

    minLen = currentChanges + futureChanges - k;
    const diff = Array(minLen);
    let ptr = link[k];
    --futureEnd;
    while (ptr) {
      const {newi, oldi} = ptr;
      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }
      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }
      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }
    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }
    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }
    return diff;
  };

  // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561
  const OND = (
    futureNodes,
    futureStart,
    rows,
    currentNodes,
    currentStart,
    cols,
    compare
  ) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;
    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND)
        return null;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];
      for (k = -d; k <= d; k += 2) {
        if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }
        r = c - k;
        while (
          c < cols &&
          r < rows &&
          compare(
            currentNodes[currentStart + c],
            futureNodes[futureStart + r]
          )
        ) {
          c++;
          r++;
        }
        if (c === cols && r === rows) {
          break outer;
        }
        cv[d + k] = c;
      }
    }

    const diff = Array(d / 2 + length / 2);
    let diffIdx = diff.length - 1;
    for (d = v.length - 1; d >= 0; d--) {
      while (
        c > 0 &&
        r > 0 &&
        compare(
          currentNodes[currentStart + c - 1],
          futureNodes[futureStart + r - 1]
        )
      ) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }
      if (!d)
        break;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      k = c - r;
      if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }
    return diff;
  };

  const applyDiff = (
    diff,
    get,
    parentNode,
    futureNodes,
    futureStart,
    currentNodes,
    currentStart,
    currentLength,
    before
  ) => {
    const live = [];
    const length = diff.length;
    let currentIndex = currentStart;
    let i = 0;
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;
        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.push(futureNodes[futureStart]);
          append(
            get,
            parentNode,
            futureNodes,
            futureStart++,
            futureStart,
            currentIndex < currentLength ?
              get(currentNodes[currentIndex], 0) :
              before
          );
          break;
        case DELETION:
          currentIndex++;
          break;
      }
    }
    i = 0;
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;
        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (-1 < live.indexOf(currentNodes[currentStart]))
            currentStart++;
          else
            remove(
              get,
              currentNodes,
              currentStart++,
              currentStart
            );
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;
    while (lo < hi) {
      const mid = ((lo + hi) / 2) >>> 0;
      if (j < ktr[mid])
        hi = mid;
      else
        lo = mid + 1;
    }
    return lo;
  };

  const smartDiff = (
    get,
    parentNode,
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
    currentLength,
    compare,
    before
  ) => {
    applyDiff(
      OND(
        futureNodes,
        futureStart,
        futureChanges,
        currentNodes,
        currentStart,
        currentChanges,
        compare
      ) ||
      HS(
        futureNodes,
        futureStart,
        futureEnd,
        futureChanges,
        currentNodes,
        currentStart,
        currentEnd,
        currentChanges
      ),
      get,
      parentNode,
      futureNodes,
      futureStart,
      currentNodes,
      currentStart,
      currentLength,
      before
    );
  };

  const drop = node => (node.remove || dropChild).call(node);

  function dropChild() {
    const {parentNode} = this;
    /* istanbul ignore else */
    if (parentNode)
      parentNode.removeChild(this);
  }

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  const domdiff = (
    parentNode,     // where changes happen
    currentNodes,   // Array of current items/nodes
    futureNodes,    // Array of future items/nodes
    options         // optional object with one of the following properties
                    //  before: domNode
                    //  compare(generic, generic) => true if same generic
                    //  node(generic) => Node
  ) => {
    if (!options)
      options = {};

    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);

    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;

    let futureEnd = futureNodes.length;
    let futureStart = 0;

    // common prefix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentStart], futureNodes[futureStart])
    ) {
      currentStart++;
      futureStart++;
    }

    // common suffix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])
    ) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd;

    // same list
    if (currentSame && futureSame)
      return futureNodes;

    // only stuff to add
    if (currentSame && futureStart < futureEnd) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentStart, currentLength, before)
      );
      return futureNodes;
    }

    // only stuff to remove
    if (futureSame && currentStart < currentEnd) {
      remove(
        get,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1;

    // 2 simple indels: the shortest sequence is a subsequence of the longest
    if (currentChanges < futureChanges) {
      i = indexOf(
        futureNodes,
        futureStart,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      );
      // inner diff
      if (-1 < i) {
        append(
          get,
          parentNode,
          futureNodes,
          futureStart,
          i,
          get(currentNodes[currentStart], 0)
        );
        append(
          get,
          parentNode,
          futureNodes,
          i + currentChanges,
          futureEnd,
          next(get, currentNodes, currentEnd, currentLength, before)
        );
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
      i = indexOf(
        currentNodes,
        currentStart,
        currentEnd,
        futureNodes,
        futureStart,
        futureEnd,
        compare
      );
      // outer diff
      if (-1 < i) {
        remove(
          get,
          currentNodes,
          currentStart,
          i
        );
        remove(
          get,
          currentNodes,
          i + futureChanges,
          currentEnd
        );
        return futureNodes;
      }
    }

    // common case with one replacement for many nodes
    // or many nodes replaced for a single one
    /* istanbul ignore else */
    if ((currentChanges < 2 || futureChanges < 2)) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        get(currentNodes[currentStart], 0)
      );
      remove(
        get,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too

    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.
    if (
      currentChanges === futureChanges &&
      isReversed(
        futureNodes,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      )
    ) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentEnd, currentLength, before)
      );
      return futureNodes;
    }

    // last resort through a smart diff
    smartDiff(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      futureChanges,
      currentNodes,
      currentStart,
      currentEnd,
      currentChanges,
      currentLength,
      compare,
      before
    );

    return futureNodes;
  };

  /*! (c) Andrea Giammarchi - ISC */
  var self$1 = {};
  self$1.CustomEvent = typeof CustomEvent === 'function' ?
    CustomEvent :
    (function (__p__) {
      CustomEvent[__p__] = new CustomEvent('').constructor[__p__];
      return CustomEvent;
      function CustomEvent(type, init) {
        if (!init) init = {};
        var e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, !!init.bubbles, !!init.cancelable, init.detail);
        return e;
      }
    }('prototype'));
  var CustomEvent$1 = self$1.CustomEvent;

  /*! (c) Andrea Giammarchi - ISC */
  var self = {};
  try { self.Map = Map; }
  catch (Map) {
    self.Map = function Map() {
      var i = 0;
      var k = [];
      var v = [];
      return {
        delete: function (key) {
          var had = contains(key);
          if (had) {
            k.splice(i, 1);
            v.splice(i, 1);
          }
          return had;
        },
        forEach: function forEach(callback, context) {
          k.forEach(
            function (key, i)  {
              callback.call(context, v[i], key, this);
            },
            this
          );
        },
        get: function get(key) {
          return contains(key) ? v[i] : void 0;
        },
        has: function has(key) {
          return contains(key);
        },
        set: function set(key, value) {
          v[contains(key) ? i : (k.push(key) - 1)] = value;
          return this;
        }
      };
      function contains(v) {
        i = k.indexOf(v);
        return -1 < i;
      }
    };
  }
  var Map$1 = self.Map;

  // hyperHTML.Component is a very basic class
  // able to create Custom Elements like components
  // including the ability to listen to connect/disconnect
  // events via onconnect/ondisconnect attributes
  // Components can be created imperatively or declaratively.
  // The main difference is that declared components
  // will not automatically render on setState(...)
  // to simplify state handling on render.
  function Component() {
    return this; // this is needed in Edge !!!
  }

  // Component is lazily setup because it needs
  // wire mechanism as lazy content
  function setup(content) {
    // there are various weakly referenced variables in here
    // and mostly are to use Component.for(...) static method.
    const children = new WeakMap$1;
    const create = Object.create;
    const createEntry = (wm, id, component) => {
      wm.set(id, component);
      return component;
    };
    const get = (Class, info, context, id) => {
      const relation = info.get(Class) || relate(Class, info);
      switch (typeof id) {
        case 'object':
        case 'function':
          const wm = relation.w || (relation.w = new WeakMap$1);
          return wm.get(id) || createEntry(wm, id, new Class(context));
        default:
          const sm = relation.p || (relation.p = create(null));
          return sm[id] || (sm[id] = new Class(context));
      }
    };
    const relate = (Class, info) => {
      const relation = {w: null, p: null};
      info.set(Class, relation);
      return relation;
    };
    const set = context => {
      const info = new Map$1;
      children.set(context, info);
      return info;
    };
    // The Component Class
    Object.defineProperties(
      Component,
      {
        // Component.for(context[, id]) is a convenient way
        // to automatically relate data/context to children components
        // If not created yet, the new Component(context) is weakly stored
        // and after that same instance would always be returned.
        for: {
          configurable: true,
          value(context, id) {
            return get(
              this,
              children.get(context) || set(context),
              context,
              id == null ?
                'default' : id
            );
          }
        }
      }
    );
    Object.defineProperties(
      Component.prototype,
      {
        // all events are handled with the component as context
        handleEvent: {value(e) {
          const ct = e.currentTarget;
          this[
            ('getAttribute' in ct && ct.getAttribute('data-call')) ||
            ('on' + e.type)
          ](e);
        }},
        // components will lazily define html or svg properties
        // as soon as these are invoked within the .render() method
        // Such render() method is not provided by the base class
        // but it must be available through the Component extend.
        // Declared components could implement a
        // render(props) method too and use props as needed.
        html: lazyGetter('html', content),
        svg: lazyGetter('svg', content),
        // the state is a very basic/simple mechanism inspired by Preact
        state: lazyGetter('state', function () { return this.defaultState; }),
        // it is possible to define a default state that'd be always an object otherwise
        defaultState: {get() { return {}; }},
        // dispatch a bubbling, cancelable, custom event
        // through the first known/available node
        dispatch: {value(type, detail) {
          const {_wire$} = this;
          if (_wire$) {
            const event = new CustomEvent$1(type, {
              bubbles: true,
              cancelable: true,
              detail
            });
            event.component = this;
            return (_wire$.dispatchEvent ?
                      _wire$ :
                      _wire$.firstChild
                    ).dispatchEvent(event);
          }
          return false;
        }},
        // setting some property state through a new object
        // or a callback, triggers also automatically a render
        // unless explicitly specified to not do so (render === false)
        setState: {value(state, render) {
          const target = this.state;
          const source = typeof state === 'function' ? state.call(this, target) : state;
          for (const key in source) target[key] = source[key];
          if (render !== false)
            this.render();
          return this;
        }}
      }
    );
  }

  // instead of a secret key I could've used a WeakMap
  // However, attaching a property directly will result
  // into better performance with thousands of components
  // hanging around, and less memory pressure caused by the WeakMap
  const lazyGetter = (type, fn) => {
    const secret = '_' + type + '$';
    return {
      get() {
        return this[secret] || setValue(this, secret, fn.call(this, type));
      },
      set(value) {
        setValue(this, secret, value);
      }
    };
  };

  // shortcut to set value on get or set(value)
  const setValue = (self, secret, value) =>
    Object.defineProperty(self, secret, {
      configurable: true,
      value: typeof value === 'function' ?
        function () {
          return (self._wire$ = value.apply(this, arguments));
        } :
        value
    })[secret]
  ;

  Object.defineProperties(
    Component.prototype,
    {
      // used to distinguish better than instanceof
      ELEMENT_NODE: {value: 1},
      nodeType: {value: -1}
    }
  );

  const attributes = {};
  const intents = {};
  const keys = [];
  const hasOwnProperty = intents.hasOwnProperty;

  let length = 0;

  var Intent = {

    // used to invoke right away hyper:attributes
    attributes,

    // hyperHTML.define('intent', (object, update) => {...})
    // can be used to define a third parts update mechanism
    // when every other known mechanism failed.
    // hyper.define('user', info => info.name);
    // hyper(node)`<p>${{user}}</p>`;
    define: (intent, callback) => {
      if (intent.indexOf('-') < 0) {
        if (!(intent in intents)) {
          length = keys.push(intent);
        }
        intents[intent] = callback;
      } else {
        attributes[intent] = callback;
      }
    },

    // this method is used internally as last resort
    // to retrieve a value out of an object
    invoke: (object, callback) => {
      for (let i = 0; i < length; i++) {
        let key = keys[i];
        if (hasOwnProperty.call(object, key)) {
          return intents[key](object[key], callback);
        }
      }
    }
  };

  var isArray = Array.isArray || /* istanbul ignore next */ (function (toString) {
    /* istanbul ignore next */
    var $ = toString.call([]);
    /* istanbul ignore next */
    return function isArray(object) {
      return toString.call(object) === $;
    };
  }({}.toString));

  /*! (c) Andrea Giammarchi - ISC */
  var createContent = (function (document) {  var FRAGMENT = 'fragment';
    var TEMPLATE = 'template';
    var HAS_CONTENT = 'content' in create(TEMPLATE);

    var createHTML = HAS_CONTENT ?
      function (html) {
        var template = create(TEMPLATE);
        template.innerHTML = html;
        return template.content;
      } :
      function (html) {
        var content = create(FRAGMENT);
        var template = create(TEMPLATE);
        var childNodes = null;
        if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
          var selector = RegExp.$1;
          template.innerHTML = '<table>' + html + '</table>';
          childNodes = template.querySelectorAll(selector);
        } else {
          template.innerHTML = html;
          childNodes = template.childNodes;
        }
        append(content, childNodes);
        return content;
      };

    return function createContent(markup, type) {
      return (type === 'svg' ? createSVG : createHTML)(markup);
    };

    function append(root, childNodes) {
      var length = childNodes.length;
      while (length--)
        root.appendChild(childNodes[0]);
    }

    function create(element) {
      return element === FRAGMENT ?
        document.createDocumentFragment() :
        document.createElementNS('http://www.w3.org/1999/xhtml', element);
    }

    // it could use createElementNS when hasNode is there
    // but this fallback is equally fast and easier to maintain
    // it is also battle tested already in all IE
    function createSVG(svg) {
      var content = create(FRAGMENT);
      var template = create('div');
      template.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
      append(content, template.firstChild.childNodes);
      return content;
    }

  }(document));

  /*! (c) Andrea Giammarchi */
  function disconnected(poly) {  var Event = poly.Event;
    var WeakSet = poly.WeakSet;
    var notObserving = true;
    var observer = null;
    return function observe(node) {
      if (notObserving) {
        notObserving = !notObserving;
        observer = new WeakSet;
        startObserving(node.ownerDocument);
      }
      observer.add(node);
      return node;
    };
    function startObserving(document) {
      var connected = new WeakSet;
      var disconnected = new WeakSet;
      try {
        (new MutationObserver(changes)).observe(
          document,
          {subtree: true, childList: true}
        );
      }
      catch(o_O) {
        var timer = 0;
        var records = [];
        var reschedule = function (record) {
          records.push(record);
          clearTimeout(timer);
          timer = setTimeout(
            function () {
              changes(records.splice(timer = 0, records.length));
            },
            0
          );
        };
        document.addEventListener(
          'DOMNodeRemoved',
          function (event) {
            reschedule({addedNodes: [], removedNodes: [event.target]});
          },
          true
        );
        document.addEventListener(
          'DOMNodeInserted',
          function (event) {
            reschedule({addedNodes: [event.target], removedNodes: []});
          },
          true
        );
      }
      function changes(records) {
        for (var
          record,
          length = records.length,
          i = 0; i < length; i++
        ) {
          record = records[i];
          dispatchAll(record.removedNodes, 'disconnected', disconnected, connected);
          dispatchAll(record.addedNodes, 'connected', connected, disconnected);
        }
      }
      function dispatchAll(nodes, type, wsin, wsout) {
        for (var
          node,
          event = new Event(type),
          length = nodes.length,
          i = 0; i < length;
          (node = nodes[i++]).nodeType === 1 &&
          dispatchTarget(node, event, type, wsin, wsout)
        );
      }
      function dispatchTarget(node, event, type, wsin, wsout) {
        if (observer.has(node) && !wsin.has(node)) {
          wsout.delete(node);
          wsin.add(node);
          node.dispatchEvent(event);
          /*
          // The event is not bubbling (perf reason: should it?),
          // hence there's no way to know if
          // stop/Immediate/Propagation() was called.
          // Should DOM Level 0 work at all?
          // I say it's a YAGNI case for the time being,
          // and easy to implement in user-land.
          if (!event.cancelBubble) {
            var fn = node['on' + type];
            if (fn)
              fn.call(node, event);
          }
          */
        }
        for (var
          // apparently is node.children || IE11 ... ^_^;;
          // https://github.com/WebReflection/disconnected/issues/1
          children = node.children || [],
          length = children.length,
          i = 0; i < length;
          dispatchTarget(children[i++], event, type, wsin, wsout)
        );
      }
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var importNode = (function (
    document,
    appendChild,
    cloneNode,
    createTextNode,
    importNode
  ) {
    var native = importNode in document;
    // IE 11 has problems with cloning templates:
    // it "forgets" empty childNodes. This feature-detects that.
    var fragment = document.createDocumentFragment();
    fragment[appendChild](document[createTextNode]('g'));
    fragment[appendChild](document[createTextNode](''));
    /* istanbul ignore next */
    var content = native ?
      document[importNode](fragment, true) :
      fragment[cloneNode](true);
    return content.childNodes.length < 2 ?
      function importNode(node, deep) {
        var clone = node[cloneNode]();
        for (var
          /* istanbul ignore next */
          childNodes = node.childNodes || [],
          length = childNodes.length,
          i = 0; deep && i < length; i++
        ) {
          clone[appendChild](importNode(childNodes[i], deep));
        }
        return clone;
      } :
      /* istanbul ignore next */
      (native ?
        document[importNode] :
        function (node, deep) {
          return node[cloneNode](!!deep);
        }
      );
  }(
    document,
    'appendChild',
    'cloneNode',
    'createTextNode',
    'importNode'
  ));

  var trim = ''.trim || /* istanbul ignore next */ function () {
    return String(this).replace(/^\s+|\s+/g, '');
  };

  /*! (c) Andrea Giammarchi - ISC */

  // Custom
  var UID = '-' + Math.random().toFixed(6) + '%';
  //                           Edge issue!

  var UID_IE = false;

  try {
    if (!(function (template, content, tabindex) {
      return content in template && (
        (template.innerHTML = '<p ' + tabindex + '="' + UID + '"></p>'),
        template[content].childNodes[0].getAttribute(tabindex) == UID
      );
    }(document.createElement('template'), 'content', 'tabindex'))) {
      UID = '_dt: ' + UID.slice(1, -1) + ';';
      UID_IE = true;
    }
  } catch(meh) {}

  var UIDC = '<!--' + UID + '-->';

  // DOM
  var COMMENT_NODE = 8;
  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var SHOULD_USE_TEXT_CONTENT = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
  var VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

  /*! (c) Andrea Giammarchi - ISC */

  function sanitize (template) {
    return template.join(UIDC)
            .replace(selfClosing, fullClosing)
            .replace(attrSeeker, attrReplacer);
  }

  var spaces = ' \\f\\n\\r\\t';
  var almostEverything = '[^' + spaces + '\\/>"\'=]+';
  var attrName = '[' + spaces + ']+' + almostEverything;
  var tagName = '<([A-Za-z]+[A-Za-z0-9:._-]*)((?:';
  var attrPartials = '(?:\\s*=\\s*(?:\'[^\']*?\'|"[^"]*?"|<[^>]*?>|' + almostEverything.replace('\\/', '') + '))?)';

  var attrSeeker = new RegExp(tagName + attrName + attrPartials + '+)([' + spaces + ']*/?>)', 'g');
  var selfClosing = new RegExp(tagName + attrName + attrPartials + '*)([' + spaces + ']*/>)', 'g');
  var findAttributes = new RegExp('(' + attrName + '\\s*=\\s*)([\'"]?)' + UIDC + '\\2', 'gi');

  function attrReplacer($0, $1, $2, $3) {
    return '<' + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
  }

  function replaceAttributes($0, $1, $2) {
    return $1 + ($2 || '"') + UID + ($2 || '"');
  }

  function fullClosing($0, $1, $2) {
    return VOID_ELEMENTS.test($1) ? $0 : ('<' + $1 + $2 + '></' + $1 + '>');
  }

  var umap = _ => ({
    // About: get: _.get.bind(_)
    // It looks like WebKit/Safari didn't optimize bind at all,
    // so that using bind slows it down by 60%.
    // Firefox and Chrome are just fine in both cases,
    // so let's use the approach that works fast everywhere 👍
    get: key => _.get(key),
    set: (key, value) => (_.set(key, value), value)
  });

  /* istanbul ignore next */
  var normalizeAttributes = UID_IE ?
    function (attributes, parts) {
      var html = parts.join(' ');
      return parts.slice.call(attributes, 0).sort(function (left, right) {
        return html.indexOf(left.name) <= html.indexOf(right.name) ? -1 : 1;
      });
    } :
    function (attributes, parts) {
      return parts.slice.call(attributes, 0);
    }
  ;

  function find(node, path) {
    var length = path.length;
    var i = 0;
    while (i < length)
      node = node.childNodes[path[i++]];
    return node;
  }

  function parse(node, holes, parts, path) {
    var childNodes = node.childNodes;
    var length = childNodes.length;
    var i = 0;
    while (i < length) {
      var child = childNodes[i];
      switch (child.nodeType) {
        case ELEMENT_NODE:
          var childPath = path.concat(i);
          parseAttributes(child, holes, parts, childPath);
          parse(child, holes, parts, childPath);
          break;
        case COMMENT_NODE:
          var textContent = child.textContent;
          if (textContent === UID) {
            parts.shift();
            holes.push(
              // basicHTML or other non standard engines
              // might end up having comments in nodes
              // where they shouldn't, hence this check.
              SHOULD_USE_TEXT_CONTENT.test(node.nodeName) ?
                Text(node, path) :
                Any(child, path.concat(i))
            );
          } else {
            switch (textContent.slice(0, 2)) {
              case '/*':
                if (textContent.slice(-2) !== '*/')
                  break;
              case '\uD83D\uDC7B': // ghost
                node.removeChild(child);
                i--;
                length--;
            }
          }
          break;
        case TEXT_NODE:
          // the following ignore is actually covered by browsers
          // only basicHTML ends up on previous COMMENT_NODE case
          // instead of TEXT_NODE because it knows nothing about
          // special style or textarea behavior
          /* istanbul ignore if */
          if (
            SHOULD_USE_TEXT_CONTENT.test(node.nodeName) &&
            trim.call(child.textContent) === UIDC
          ) {
            parts.shift();
            holes.push(Text(node, path));
          }
          break;
      }
      i++;
    }
  }

  function parseAttributes(node, holes, parts, path) {
    var attributes = node.attributes;
    var cache = [];
    var remove = [];
    var array = normalizeAttributes(attributes, parts);
    var length = array.length;
    var i = 0;
    while (i < length) {
      var attribute = array[i++];
      var direct = attribute.value === UID;
      var sparse;
      if (direct || 1 < (sparse = attribute.value.split(UIDC)).length) {
        var name = attribute.name;
        // the following ignore is covered by IE
        // and the IE9 double viewBox test
        /* istanbul ignore else */
        if (cache.indexOf(name) < 0) {
          cache.push(name);
          var realName = parts.shift().replace(
            direct ?
              /^(?:|[\S\s]*?\s)(\S+?)\s*=\s*('|")?$/ :
              new RegExp(
                '^(?:|[\\S\\s]*?\\s)(' + name + ')\\s*=\\s*(\'|")[\\S\\s]*',
                'i'
              ),
              '$1'
          );
          var value = attributes[realName] ||
                        // the following ignore is covered by browsers
                        // while basicHTML is already case-sensitive
                        /* istanbul ignore next */
                        attributes[realName.toLowerCase()];
          if (direct)
            holes.push(Attr(value, path, realName, null));
          else {
            var skip = sparse.length - 2;
            while (skip--)
              parts.shift();
            holes.push(Attr(value, path, realName, sparse));
          }
        }
        remove.push(attribute);
      }
    }
    length = remove.length;
    i = 0;

    /* istanbul ignore next */
    var cleanValue = 0 < length && UID_IE && !('ownerSVGElement' in node);
    while (i < length) {
      // Edge HTML bug #16878726
      var attr = remove[i++];
      // IE/Edge bug lighterhtml#63 - clean the value or it'll persist
      /* istanbul ignore next */
      if (cleanValue)
        attr.value = '';
      // IE/Edge bug lighterhtml#64 - don't use removeAttributeNode
      node.removeAttribute(attr.name);
    }

    // This is a very specific Firefox/Safari issue
    // but since it should be a not so common pattern,
    // it's probably worth patching regardless.
    // Basically, scripts created through strings are death.
    // You need to create fresh new scripts instead.
    // TODO: is there any other node that needs such nonsense?
    var nodeName = node.nodeName;
    if (/^script$/i.test(nodeName)) {
      // this used to be like that
      // var script = createElement(node, nodeName);
      // then Edge arrived and decided that scripts created
      // through template documents aren't worth executing
      // so it became this ... hopefully it won't hurt in the wild
      var script = document.createElement(nodeName);
      length = attributes.length;
      i = 0;
      while (i < length)
        script.setAttributeNode(attributes[i++].cloneNode(true));
      script.textContent = node.textContent;
      node.parentNode.replaceChild(script, node);
    }
  }

  function Any(node, path) {
    return {
      type: 'any',
      node: node,
      path: path
    };
  }

  function Attr(node, path, name, sparse) {
    return {
      type: 'attr',
      node: node,
      path: path,
      name: name,
      sparse: sparse
    };
  }

  function Text(node, path) {
    return {
      type: 'text',
      node: node,
      path: path
    };
  }

  // globals

  var parsed = umap(new WeakMap$1);

  function createInfo(options, template) {
    var markup = (options.convert || sanitize)(template);
    var transform = options.transform;
    if (transform)
      markup = transform(markup);
    var content = createContent(markup, options.type);
    cleanContent(content);
    var holes = [];
    parse(content, holes, template.slice(0), []);
    return {
      content: content,
      updates: function (content) {
        var updates = [];
        var len = holes.length;
        var i = 0;
        var off = 0;
        while (i < len) {
          var info = holes[i++];
          var node = find(content, info.path);
          switch (info.type) {
            case 'any':
              updates.push({fn: options.any(node, []), sparse: false});
              break;
            case 'attr':
              var sparse = info.sparse;
              var fn = options.attribute(node, info.name, info.node);
              if (sparse === null)
                updates.push({fn: fn, sparse: false});
              else {
                off += sparse.length - 2;
                updates.push({fn: fn, sparse: true, values: sparse});
              }
              break;
            case 'text':
              updates.push({fn: options.text(node), sparse: false});
              node.textContent = '';
              break;
          }
        }
        len += off;
        return function () {
          var length = arguments.length;
          if (len !== (length - 1)) {
            throw new Error(
              (length - 1) + ' values instead of ' + len + '\n' +
              template.join('${value}')
            );
          }
          var i = 1;
          var off = 1;
          while (i < length) {
            var update = updates[i - off];
            if (update.sparse) {
              var values = update.values;
              var value = values[0];
              var j = 1;
              var l = values.length;
              off += l - 2;
              while (j < l)
                value += arguments[i++] + values[j++];
              update.fn(value);
            }
            else
              update.fn(arguments[i++]);
          }
          return content;
        };
      }
    };
  }

  function createDetails(options, template) {
    var info = parsed.get(template) || parsed.set(template, createInfo(options, template));
    return info.updates(importNode.call(document, info.content, true));
  }

  var empty = [];
  function domtagger(options) {
    var previous = empty;
    var updates = cleanContent;
    return function (template) {
      if (previous !== template)
        updates = createDetails(options, (previous = template));
      return updates.apply(null, arguments);
    };
  }

  function cleanContent(fragment) {
    var childNodes = fragment.childNodes;
    var i = childNodes.length;
    while (i--) {
      var child = childNodes[i];
      if (
        child.nodeType !== 1 &&
        trim.call(child.textContent).length === 0
      ) {
        fragment.removeChild(child);
      }
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var hyperStyle = (function (){  // from https://github.com/developit/preact/blob/33fc697ac11762a1cb6e71e9847670d047af7ce5/src/varants.js
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var hyphen = /([^A-Z])([A-Z]+)/g;
    return function hyperStyle(node, original) {
      return 'ownerSVGElement' in node ? svg(node, original) : update(node.style, false);
    };
    function ized($0, $1, $2) {
      return $1 + '-' + $2.toLowerCase();
    }
    function svg(node, original) {
      var style;
      if (original)
        style = original.cloneNode(true);
      else {
        node.setAttribute('style', '--hyper:style;');
        style = node.getAttributeNode('style');
      }
      style.value = '';
      node.setAttributeNode(style);
      return update(style, true);
    }
    function toStyle(object) {
      var key, css = [];
      for (key in object)
        css.push(key.replace(hyphen, ized), ':', object[key], ';');
      return css.join('');
    }
    function update(style, isSVG) {
      var oldType, oldValue;
      return function (newValue) {
        var info, key, styleValue, value;
        switch (typeof newValue) {
          case 'object':
            if (newValue) {
              if (oldType === 'object') {
                if (!isSVG) {
                  if (oldValue !== newValue) {
                    for (key in oldValue) {
                      if (!(key in newValue)) {
                        style[key] = '';
                      }
                    }
                  }
                }
              } else {
                if (isSVG)
                  style.value = '';
                else
                  style.cssText = '';
              }
              info = isSVG ? {} : style;
              for (key in newValue) {
                value = newValue[key];
                styleValue = typeof value === 'number' &&
                                    !IS_NON_DIMENSIONAL.test(key) ?
                                    (value + 'px') : value;
                if (!isSVG && /^--/.test(key))
                  info.setProperty(key, styleValue);
                else
                  info[key] = styleValue;
              }
              oldType = 'object';
              if (isSVG)
                style.value = toStyle((oldValue = info));
              else
                oldValue = newValue;
              break;
            }
          default:
            if (oldValue != newValue) {
              oldType = 'string';
              oldValue = newValue;
              if (isSVG)
                style.value = newValue || '';
              else
                style.cssText = newValue || '';
            }
            break;
        }
      };
    }
  }());

  /*! (c) Andrea Giammarchi - ISC */
  var Wire = (function (slice, proto) {

    proto = Wire.prototype;

    proto.ELEMENT_NODE = 1;
    proto.nodeType = 111;

    proto.remove = function (keepFirst) {
      var childNodes = this.childNodes;
      var first = this.firstChild;
      var last = this.lastChild;
      this._ = null;
      if (keepFirst && childNodes.length === 2) {
        last.parentNode.removeChild(last);
      } else {
        var range = this.ownerDocument.createRange();
        range.setStartBefore(keepFirst ? childNodes[1] : first);
        range.setEndAfter(last);
        range.deleteContents();
      }
      return first;
    };

    proto.valueOf = function (forceAppend) {
      var fragment = this._;
      var noFragment = fragment == null;
      if (noFragment)
        fragment = (this._ = this.ownerDocument.createDocumentFragment());
      if (noFragment || forceAppend) {
        for (var n = this.childNodes, i = 0, l = n.length; i < l; i++)
          fragment.appendChild(n[i]);
      }
      return fragment;
    };

    return Wire;

    function Wire(childNodes) {
      var nodes = (this.childNodes = slice.call(childNodes, 0));
      this.firstChild = nodes[0];
      this.lastChild = nodes[nodes.length - 1];
      this.ownerDocument = nodes[0].ownerDocument;
      this._ = null;
    }

  }([].slice));

  // Node.CONSTANTS
  const DOCUMENT_FRAGMENT_NODE = 11;

  // SVG related constants
  const OWNER_SVG_ELEMENT = 'ownerSVGElement';

  // Custom Elements / MutationObserver constants
  const CONNECTED = 'connected';
  const DISCONNECTED = 'dis' + CONNECTED;

  const componentType = Component.prototype.nodeType;
  const wireType = Wire.prototype.nodeType;

  const observe = disconnected({Event: CustomEvent$1, WeakSet: WeakSet$1});

  // returns an intent to explicitly inject content as html
  const asHTML = html => ({html});

  // returns nodes from wires and components
  const asNode = (item, i) => {
    switch (item.nodeType) {
      case wireType:
        // in the Wire case, the content can be
        // removed, post-pended, inserted, or pre-pended and
        // all these cases are handled by domdiff already
        /* istanbul ignore next */
        return (1 / i) < 0 ?
          (i ? item.remove(true) : item.lastChild) :
          (i ? item.valueOf(true) : item.firstChild);
      case componentType:
        return asNode(item.render(), i);
      default:
        return item;
    }
  };

  // returns true if domdiff can handle the value
  const canDiff = value => 'ELEMENT_NODE' in value;

  // borrowed from uhandlers
  // https://github.com/WebReflection/uhandlers
  const booleanSetter = (node, key, oldValue) => newValue => {
    if (oldValue !== !!newValue) {
      if ((oldValue = !!newValue))
        node.setAttribute(key, '');
      else
        node.removeAttribute(key);
    }
  };

  const hyperSetter = (node, name, svg) => svg ?
    value => {
      try {
        node[name] = value;
      }
      catch (nope) {
        node.setAttribute(name, value);
      }
    } :
    value => {
      node[name] = value;
    };

  // when a Promise is used as interpolation value
  // its result must be parsed once resolved.
  // This callback is in charge of understanding what to do
  // with a returned value once the promise is resolved.
  const invokeAtDistance = (value, callback) => {
    callback(value.placeholder);
    if ('text' in value) {
      Promise.resolve(value.text).then(String).then(callback);
    } else if ('any' in value) {
      Promise.resolve(value.any).then(callback);
    } else if ('html' in value) {
      Promise.resolve(value.html).then(asHTML).then(callback);
    } else {
      Promise.resolve(Intent.invoke(value, callback)).then(callback);
    }
  };

  // quick and dirty way to check for Promise/ish values
  const isPromise_ish = value => value != null && 'then' in value;

  // list of attributes that should not be directly assigned
  const readOnly = /^(?:form|list)$/i;

  // reused every slice time
  const slice = [].slice;

  // simplifies text node creation
  const text = (node, text) => node.ownerDocument.createTextNode(text);

  function Tagger(type) {
    this.type = type;
    return domtagger(this);
  }

  Tagger.prototype = {

    // there are four kind of attributes, and related behavior:
    //  * events, with a name starting with `on`, to add/remove event listeners
    //  * special, with a name present in their inherited prototype, accessed directly
    //  * regular, accessed through get/setAttribute standard DOM methods
    //  * style, the only regular attribute that also accepts an object as value
    //    so that you can style=${{width: 120}}. In this case, the behavior has been
    //    fully inspired by Preact library and its simplicity.
    attribute(node, name, original) {
      const isSVG = OWNER_SVG_ELEMENT in node;
      let oldValue;
      // if the attribute is the style one
      // handle it differently from others
      if (name === 'style')
        return hyperStyle(node, original, isSVG);
      // direct accessors for <input .value=${...}> and friends
      else if (name.slice(0, 1) === '.')
        return hyperSetter(node, name.slice(1), isSVG);
      // boolean accessors for <input .value=${...}> and friends
      else if (name.slice(0, 1) === '?')
        return booleanSetter(node, name.slice(1));
      // the name is an event one,
      // add/remove event listeners accordingly
      else if (/^on/.test(name)) {
        let type = name.slice(2);
        if (type === CONNECTED || type === DISCONNECTED) {
          observe(node);
        }
        else if (name.toLowerCase()
          in node) {
          type = type.toLowerCase();
        }
        return newValue => {
          if (oldValue !== newValue) {
            if (oldValue)
              node.removeEventListener(type, oldValue, false);
            oldValue = newValue;
            if (newValue)
              node.addEventListener(type, newValue, false);
          }
        };
      }
      // the attribute is special ('value' in input)
      // and it's not SVG *or* the name is exactly data,
      // in this case assign the value directly
      else if (
        name === 'data' ||
        (!isSVG && name in node && !readOnly.test(name))
      ) {
        return newValue => {
          if (oldValue !== newValue) {
            oldValue = newValue;
            if (node[name] !== newValue && newValue == null) {
              // cleanup on null to avoid silly IE/Edge bug
              node[name] = '';
              node.removeAttribute(name);
            }
            else
              node[name] = newValue;
          }
        };
      }
      else if (name in Intent.attributes) {
        return any => {
          const newValue = Intent.attributes[name](node, any);
          if (oldValue !== newValue) {
            oldValue = newValue;
            if (newValue == null)
              node.removeAttribute(name);
            else
              node.setAttribute(name, newValue);
          }
        };
      }
      // in every other case, use the attribute node as it is
      // update only the value, set it as node only when/if needed
      else {
        let owner = false;
        const attribute = original.cloneNode(true);
        return newValue => {
          if (oldValue !== newValue) {
            oldValue = newValue;
            if (attribute.value !== newValue) {
              if (newValue == null) {
                if (owner) {
                  owner = false;
                  node.removeAttributeNode(attribute);
                }
                attribute.value = newValue;
              } else {
                attribute.value = newValue;
                if (!owner) {
                  owner = true;
                  node.setAttributeNode(attribute);
                }
              }
            }
          }
        };
      }
    },

    // in a hyper(node)`<div>${content}</div>` case
    // everything could happen:
    //  * it's a JS primitive, stored as text
    //  * it's null or undefined, the node should be cleaned
    //  * it's a component, update the content by rendering it
    //  * it's a promise, update the content once resolved
    //  * it's an explicit intent, perform the desired operation
    //  * it's an Array, resolve all values if Promises and/or
    //    update the node with the resulting list of content
    any(node, childNodes) {
      const diffOptions = {node: asNode, before: node};
      const nodeType = OWNER_SVG_ELEMENT in node ? /* istanbul ignore next */ 'svg' : 'html';
      let fastPath = false;
      let oldValue;
      const anyContent = value => {
        switch (typeof value) {
          case 'string':
          case 'number':
          case 'boolean':
            if (fastPath) {
              if (oldValue !== value) {
                oldValue = value;
                childNodes[0].textContent = value;
              }
            } else {
              fastPath = true;
              oldValue = value;
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                [text(node, value)],
                diffOptions
              );
            }
            break;
          case 'function':
            anyContent(value(node));
            break;
          case 'object':
          case 'undefined':
            if (value == null) {
              fastPath = false;
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                [],
                diffOptions
              );
              break;
            }
          default:
            fastPath = false;
            oldValue = value;
            if (isArray(value)) {
              if (value.length === 0) {
                if (childNodes.length) {
                  childNodes = domdiff(
                    node.parentNode,
                    childNodes,
                    [],
                    diffOptions
                  );
                }
              } else {
                switch (typeof value[0]) {
                  case 'string':
                  case 'number':
                  case 'boolean':
                    anyContent({html: value});
                    break;
                  case 'object':
                    if (isArray(value[0])) {
                      value = value.concat.apply([], value);
                    }
                    if (isPromise_ish(value[0])) {
                      Promise.all(value).then(anyContent);
                      break;
                    }
                  default:
                    childNodes = domdiff(
                      node.parentNode,
                      childNodes,
                      value,
                      diffOptions
                    );
                    break;
                }
              }
            } else if (canDiff(value)) {
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                value.nodeType === DOCUMENT_FRAGMENT_NODE ?
                  slice.call(value.childNodes) :
                  [value],
                diffOptions
              );
            } else if (isPromise_ish(value)) {
              value.then(anyContent);
            } else if ('placeholder' in value) {
              invokeAtDistance(value, anyContent);
            } else if ('text' in value) {
              anyContent(String(value.text));
            } else if ('any' in value) {
              anyContent(value.any);
            } else if ('html' in value) {
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                slice.call(
                  createContent(
                    [].concat(value.html).join(''),
                    nodeType
                  ).childNodes
                ),
                diffOptions
              );
            } else if ('length' in value) {
              anyContent(slice.call(value));
            } else {
              anyContent(Intent.invoke(value, anyContent));
            }
            break;
        }
      };
      return anyContent;
    },

    // style or textareas don't accept HTML as content
    // it's pointless to transform or analyze anything
    // different from text there but it's worth checking
    // for possible defined intents.
    text(node) {
      let oldValue;
      const textContent = value => {
        if (oldValue !== value) {
          oldValue = value;
          const type = typeof value;
          if (type === 'object' && value) {
            if (isPromise_ish(value)) {
              value.then(textContent);
            } else if ('placeholder' in value) {
              invokeAtDistance(value, textContent);
            } else if ('text' in value) {
              textContent(String(value.text));
            } else if ('any' in value) {
              textContent(value.any);
            } else if ('html' in value) {
              textContent([].concat(value.html).join(''));
            } else if ('length' in value) {
              textContent(slice.call(value).join(''));
            } else {
              textContent(Intent.invoke(value, textContent));
            }
          } else if (type === 'function') {
            textContent(value(node));
          } else {
            node.textContent = value == null ? '' : value;
          }
        }
      };
      return textContent;
    }
  };

  var isNoOp = typeof document !== 'object';

  var templateLiteral = function (tl) {
    var RAW = 'raw';
    var isBroken = function (UA) {
      return /(Firefox|Safari)\/(\d+)/.test(UA) &&
            !/(Chrom[eium]+|Android)\/(\d+)/.test(UA);
    };
    var broken = isBroken((document.defaultView.navigator || {}).userAgent);
    var FTS = !(RAW in tl) ||
              tl.propertyIsEnumerable(RAW) ||
              !Object.isFrozen(tl[RAW]);
    if (broken || FTS) {
      var forever = {};
      var foreverCache = function (tl) {
        for (var key = '.', i = 0; i < tl.length; i++)
          key += tl[i].length + '.' + tl[i];
        return forever[key] || (forever[key] = tl);
      };
      // Fallback TypeScript shenanigans
      if (FTS)
        templateLiteral = foreverCache;
      // try fast path for other browsers:
      // store the template as WeakMap key
      // and forever cache it only when it's not there.
      // this way performance is still optimal,
      // penalized only when there are GC issues
      else {
        var wm = new WeakMap$1;
        var set = function (tl, unique) {
          wm.set(tl, unique);
          return unique;
        };
        templateLiteral = function (tl) {
          return wm.get(tl) || set(tl, foreverCache(tl));
        };
      }
    } else {
      isNoOp = true;
    }
    return TL(tl);
  };

  function TL(tl) {
    return isNoOp ? tl : templateLiteral(tl);
  }

  function tta (template) {
    var length = arguments.length;
    var args = [TL(template)];
    var i = 1;
    while (i < length)
      args.push(arguments[i++]);
    return args;
  }
  /**
   * best benchmark goes here
   * https://jsperf.com/tta-bench
   * I should probably have an @ungap/template-literal-es too
  export default (...args) => {
    args[0] = unique(args[0]);
    return args;
  };
   */

  // all wires used per each context
  const wires = new WeakMap$1;

  // A wire is a callback used as tag function
  // to lazily relate a generic object to a template literal.
  // hyper.wire(user)`<div id=user>${user.name}</div>`; => the div#user
  // This provides the ability to have a unique DOM structure
  // related to a unique JS object through a reusable template literal.
  // A wire can specify a type, as svg or html, and also an id
  // via html:id or :id convention. Such :id allows same JS objects
  // to be associated to different DOM structures accordingly with
  // the used template literal without losing previously rendered parts.
  const wire = (obj, type) => obj == null ?
    content(type || 'html') :
    weakly(obj, type || 'html');

  // A wire content is a virtual reference to one or more nodes.
  // It's represented by either a DOM node, or an Array.
  // In both cases, the wire content role is to simply update
  // all nodes through the list of related callbacks.
  // In few words, a wire content is like an invisible parent node
  // in charge of updating its content like a bound element would do.
  const content = type => {
    let wire, tagger, template;
    return function () {
      const args = tta.apply(null, arguments);
      if (template !== args[0]) {
        template = args[0];
        tagger = new Tagger(type);
        wire = wireContent(tagger.apply(tagger, args));
      } else {
        tagger.apply(tagger, args);
      }
      return wire;
    };
  };

  // wires are weakly created through objects.
  // Each object can have multiple wires associated
  // and this is thanks to the type + :id feature.
  const weakly = (obj, type) => {
    const i = type.indexOf(':');
    let wire = wires.get(obj);
    let id = type;
    if (-1 < i) {
      id = type.slice(i + 1);
      type = type.slice(0, i) || 'html';
    }
    if (!wire)
      wires.set(obj, wire = {});
    return wire[id] || (wire[id] = content(type));
  };

  // A document fragment loses its nodes 
  // as soon as it is appended into another node.
  // This has the undesired effect of losing wired content
  // on a second render call, because (by then) the fragment would be empty:
  // no longer providing access to those sub-nodes that ultimately need to
  // stay associated with the original interpolation.
  // To prevent hyperHTML from forgetting about a fragment's sub-nodes,
  // fragments are instead returned as an Array of nodes or, if there's only one entry,
  // as a single referenced node which, unlike fragments, will indeed persist
  // wire content throughout multiple renderings.
  // The initial fragment, at this point, would be used as unique reference to this
  // array of nodes or to this single referenced node.
  const wireContent = node => {
    const childNodes = node.childNodes;
    const {length} = childNodes;
    return length === 1 ?
      childNodes[0] :
      (length ? new Wire(childNodes) : node);
  };

  // a weak collection of contexts that
  // are already known to hyperHTML
  const bewitched = new WeakMap$1;

  // better known as hyper.bind(node), the render is
  // the main tag function in charge of fully upgrading
  // or simply updating, contexts used as hyperHTML targets.
  // The `this` context is either a regular DOM node or a fragment.
  function render$1() {
    const wicked = bewitched.get(this);
    const args = tta.apply(null, arguments);
    if (wicked && wicked.template === args[0]) {
      wicked.tagger.apply(null, args);
    } else {
      upgrade.apply(this, args);
    }
    return this;
  }

  // an upgrade is in charge of collecting template info,
  // parse it once, if unknown, to map all interpolations
  // as single DOM callbacks, relate such template
  // to the current context, and render it after cleaning the context up
  function upgrade(template) {
    const type = OWNER_SVG_ELEMENT in this ? 'svg' : 'html';
    const tagger = new Tagger(type);
    bewitched.set(this, {tagger, template: template});
    this.textContent = '';
    this.appendChild(tagger.apply(null, arguments));
  }

  /*! (c) Andrea Giammarchi (ISC) */

  // all functions are self bound to the right context
  // you can do the following
  // const {bind, wire} = hyperHTML;
  // and use them right away: bind(node)`hello!`;
  const bind = context => render$1.bind(context);
  const define = Intent.define;
  const tagger = Tagger.prototype;

  hyper.Component = Component;
  hyper.bind = bind;
  hyper.define = define;
  hyper.diff = domdiff;
  hyper.hyper = hyper;
  hyper.observe = observe;
  hyper.tagger = tagger;
  hyper.wire = wire;

  // exported as shared utils
  // for projects based on hyperHTML
  // that don't necessarily need upfront polyfills
  // i.e. those still targeting IE
  hyper._ = {
    WeakMap: WeakMap$1,
    WeakSet: WeakSet$1
  };

  // the wire content is the lazy defined
  // html or svg property of each hyper.Component
  setup(content);

  // by default, hyperHTML is a smart function
  // that "magically" understands what's the best
  // thing to do with passed arguments
  function hyper(HTML) {
    return arguments.length < 2 ?
      (HTML == null ?
        content('html') :
        (typeof HTML === 'string' ?
          hyper.wire(null, HTML) :
          ('raw' in HTML ?
            content('html')(HTML) :
            ('nodeType' in HTML ?
              hyper.bind(HTML) :
              weakly(HTML, 'html')
            )
          )
        )) :
      ('raw' in HTML ?
        content('html') : hyper.wire
      ).apply(null, arguments);
  }

  /*! (C) 2017-2018 Andrea Giammarchi - ISC Style License */

  // utils to deal with custom elements builtin extends
  const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback';
  const O = Object;
  const classes = [];
  const defineProperty = O.defineProperty;
  const getOwnPropertyDescriptor = O.getOwnPropertyDescriptor;
  const getOwnPropertyNames = O.getOwnPropertyNames;
  /* istanbul ignore next */
  const getOwnPropertySymbols = O.getOwnPropertySymbols || (() => []);
  /* istanbul ignore next */
  const getPrototypeOf = O.getPrototypeOf || (o => o.__proto__);
  /* istanbul ignore next */
  const ownKeys = typeof Reflect === 'object' && Reflect.ownKeys ||
                  (o => getOwnPropertyNames(o).concat(getOwnPropertySymbols(o)));
  /* istanbul ignore next */
  const setPrototypeOf = O.setPrototypeOf ||
                        ((o, p) => (o.__proto__ = p, o));
  /* istanbul ignore stop */
  const camel = name => name.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
  const {attachShadow} = HTMLElement.prototype;
  const sr = new WeakMap;

  class HyperHTMLElement extends HTMLElement {

    // define a custom-element in the CustomElementsRegistry
    // class MyEl extends HyperHTMLElement {}
    // MyEl.define('my-el');
    static define(name, options) {
      const Class = this;
      const proto = Class.prototype;

      const onChanged = proto[ATTRIBUTE_CHANGED_CALLBACK];
      const hasChange = !!onChanged;

      // Class.booleanAttributes
      // -----------------------------------------------
      // attributes defined as boolean will have
      // an either available or not available attribute
      // regardless of the value.
      // All falsy values, or "false", mean attribute removed
      // while truthy values will be set as is.
      // Boolean attributes are also automatically observed.
      const booleanAttributes = Class.booleanAttributes || [];
      booleanAttributes.forEach(attribute => {
        const name = camel(attribute);
        if (!(name in proto)) defineProperty(
          proto,
          name,
          {
            configurable: true,
            get() {
              return this.hasAttribute(attribute);
            },
            set(value) {
              if (!value || value === 'false')
                this.removeAttribute(attribute);
              else
                this.setAttribute(attribute, '');
            }
          }
        );
      });

      // Class.observedAttributes
      // -------------------------------------------------------
      // HyperHTMLElement will directly reflect get/setAttribute
      // operation once these attributes are used, example:
      // el.observed = 123;
      // will automatically do
      // el.setAttribute('observed', 123);
      // triggering also the attributeChangedCallback
      const observedAttributes = (Class.observedAttributes || []).filter(
        attribute => booleanAttributes.indexOf(attribute) < 0
      );
      observedAttributes.forEach(attribute => {
        // it is possible to redefine the behavior at any time
        // simply overwriting get prop() and set prop(value)
        const name = camel(attribute);
        if (!(name in proto)) defineProperty(
          proto,
          name,
          {
            configurable: true,
            get() {
              return this.getAttribute(attribute);
            },
            set(value) {
              if (value == null)
                this.removeAttribute(attribute);
              else
                this.setAttribute(attribute, value);
            }
          }
        );
      });

      // if these are defined, overwrite the observedAttributes getter
      // to include also booleanAttributes
      const attributes = booleanAttributes.concat(observedAttributes);
      if (attributes.length)
        defineProperty(Class, 'observedAttributes', {
          get() { return attributes; }
        });

      // created() {}
      // ---------------------------------
      // an initializer method that grants
      // the node is fully known to the browser.
      // It is ensured to run either after DOMContentLoaded,
      // or once there is a next sibling (stream-friendly) so that
      // you have full access to element attributes and/or childNodes.
      const created = proto.created || function () {
        this.render();
      };

      // used to ensure create() is called once and once only
      defineProperty(
        proto,
        '_init$',
        {
          configurable: true,
          writable: true,
          value: true
        }
      );

      defineProperty(
        proto,
        ATTRIBUTE_CHANGED_CALLBACK,
        {
          configurable: true,
          value: function aCC(name, prev, curr) {
            if (this._init$) {
              checkReady.call(this, created, attributes, booleanAttributes);
              if (this._init$)
                return this._init$$.push(aCC.bind(this, name, prev, curr));
            }
            // ensure setting same value twice
            // won't trigger twice attributeChangedCallback
            if (hasChange && prev !== curr) {
              onChanged.apply(this, arguments);
            }
          }
        }
      );

      const onConnected = proto.connectedCallback;
      const hasConnect = !!onConnected;
      defineProperty(
        proto,
        'connectedCallback',
        {
          configurable: true,
          value: function cC() {
            if (this._init$) {
              checkReady.call(this, created, attributes, booleanAttributes);
              if (this._init$)
                return this._init$$.push(cC.bind(this));
            }
            if (hasConnect) {
              onConnected.apply(this, arguments);
            }
          }
        }
      );

      // define lazily all handlers
      // class { handleClick() { ... }
      // render() { `<a onclick=${this.handleClick}>` } }
      getOwnPropertyNames(proto).forEach(key => {
        if (/^handle[A-Z]/.test(key)) {
          const _key$ = '_' + key + '$';
          const method = proto[key];
          defineProperty(proto, key, {
            configurable: true,
            get() {
              return  this[_key$] ||
                      (this[_key$] = method.bind(this));
            }
          });
        }
      });

      // whenever you want to directly use the component itself
      // as EventListener, you can pass it directly.
      // https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
      //  class Reactive extends HyperHTMLElement {
      //    oninput(e) { console.log(this, 'changed', e.target.value); }
      //    render() { this.html`<input oninput="${this}">`; }
      //  }
      if (!('handleEvent' in proto)) {
        defineProperty(
          proto,
          'handleEvent',
          {
            configurable: true,
            value(event) {
              this[
                (event.currentTarget.dataset || {}).call ||
                ('on' + event.type)
              ](event);
            }
          }
        );
      }

      if (options && options.extends) {
        const Native = document.createElement(options.extends).constructor;
        const Intermediate = class extends Native {};
        const ckeys = ['length', 'name', 'arguments', 'caller', 'prototype'];
        const pkeys = [];
        let Super = null;
        let BaseClass = Class;
        while (Super = getPrototypeOf(BaseClass)) {
          [
            {target: Intermediate, base: Super, keys: ckeys},
            {target: Intermediate.prototype, base: Super.prototype, keys: pkeys}
          ]
          .forEach(({target, base, keys}) => {
            ownKeys(base)
              .filter(key => keys.indexOf(key) < 0)
              .forEach((key) => {
                keys.push(key);
                defineProperty(
                  target,
                  key,
                  getOwnPropertyDescriptor(base, key)
                );
              });
          });

          BaseClass = Super;
          if (Super === HyperHTMLElement)
            break;
        }
        setPrototypeOf(Class, Intermediate);
        setPrototypeOf(proto, Intermediate.prototype);
        customElements.define(name, Class, options);
      } else {
        customElements.define(name, Class);
      }
      classes.push(Class);
      return Class;
    }

    // weakly relate the shadowRoot for refs usage
    attachShadow() {
      const shadowRoot = attachShadow.apply(this, arguments);
      sr.set(this, shadowRoot);
      return shadowRoot;
    }

    // returns elements by ref
    get refs() {
      const value = {};
      if ('_html$' in this) {
        const all = (sr.get(this) || this).querySelectorAll('[ref]');
        for (let {length} = all, i = 0; i < length; i++) {
          const node = all[i];
          value[node.getAttribute('ref')] = node;
        }
        Object.defineProperty(this, 'refs', {value});
        return value;
      }
      return value;
    }

    // lazily bind once hyperHTML logic
    // to either the shadowRoot, if present and open,
    // the _shadowRoot property, if set due closed shadow root,
    // or the custom-element itself if no Shadow DOM is used.
    get html() {
      return this._html$ || (this.html = bind(
        // in a way or another, bind to the right node
        // backward compatible, first two could probably go already
        this.shadowRoot || this._shadowRoot || sr.get(this) || this
      ));
    }

    // it can be set too if necessary, it won't invoke render()
    set html(value) {
      defineProperty(this, '_html$', {configurable: true, value: value});
    }

    // overwrite this method with your own render
    render() {}

    // ---------------------//
    // Basic State Handling //
    // ---------------------//

    // define the default state object
    // you could use observed properties too
    get defaultState() { return {}; }

    // the state with a default
    get state() {
      return this._state$ || (this.state = this.defaultState);
    }

    // it can be set too if necessary, it won't invoke render()
    set state(value) {
      defineProperty(this, '_state$', {configurable: true, value: value});
    }

    // currently a state is a shallow copy, like in Preact or other libraries.
    // after the state is updated, the render() method will be invoked.
    // ⚠️ do not ever call this.setState() inside this.render()
    setState(state, render) {
      const target = this.state;
      const source = typeof state === 'function' ? state.call(this, target) : state;
      for (const key in source) target[key] = source[key];
      if (render !== false) this.render();
      return this;
    }

  }
  // exposing hyperHTML utilities
  HyperHTMLElement.Component = Component;
  HyperHTMLElement.bind = bind;
  HyperHTMLElement.intent = define;
  HyperHTMLElement.wire = wire;
  HyperHTMLElement.hyper = hyper;

  try {
    if (Symbol.hasInstance) classes.push(
      defineProperty(HyperHTMLElement, Symbol.hasInstance, {
        enumerable: false,
        configurable: true,
        value(instance) {
          return classes.some(isPrototypeOf, getPrototypeOf(instance));
        }
      }));
  } catch(meh) {}

  // ------------------------------//
  // DOMContentLoaded VS created() //
  // ------------------------------//
  const dom = {
    type: 'DOMContentLoaded',
    handleEvent() {
      if (dom.ready()) {
        document.removeEventListener(dom.type, dom, false);
        dom.list.splice(0).forEach(invoke);
      }
      else
        setTimeout(dom.handleEvent);
    },
    ready() {
      return document.readyState === 'complete';
    },
    list: []
  };

  if (!dom.ready()) {
    document.addEventListener(dom.type, dom, false);
  }

  function checkReady(created, attributes, booleanAttributes) {
    if (dom.ready() || isReady.call(this, created, attributes, booleanAttributes)) {
      if (this._init$) {
        const list = this._init$$ || [];
        delete this._init$$;
        const self = defineProperty(this, '_init$', {value: false});
        booleanAttributes.forEach(name => {
          if (self.getAttribute(name) === 'false')
            self.removeAttribute(name);
        });
        attributes.forEach(name => {
          if (self.hasOwnProperty(name)) {
            const curr = self[name];
            delete self[name];
            list.unshift(() => { self[name] = curr; });
          }
        });
        created.call(self);
        list.forEach(invoke);
      }
    } else {
      if (!this.hasOwnProperty('_init$$'))
        defineProperty(this, '_init$$', {configurable: true, value: []});
      dom.list.push(checkReady.bind(this, created, attributes, booleanAttributes));
    }
  }

  function invoke(fn) {
    fn();
  }

  function isPrototypeOf(Class) {
    return this === Class.prototype;
  }

  function isReady(created, attributes, booleanAttributes) {
    let el = this;
    do { if (el.nextSibling) return true; }
    while (el = el.parentNode);
    setTimeout(checkReady.bind(this, created, attributes, booleanAttributes));
    return false;
  }

  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []); // modifiers that need to read the DOM

  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead'; // pure-logic modifiers

  var beforeMain = 'beforeMain';
  var main$1 = 'main';
  var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main$1, afterMain, beforeWrite, write, afterWrite];

  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  function getWindow(node) {
    if (node == null) {
      return window;
    }

    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }

    return node;
  }

  function isElement$1(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }

  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }

  function isShadowRoot(node) {
    // IE 11 has no ShadowRoot
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }

    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // and applies them to the HTMLElements such as popper and arrow

  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name]; // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most
      // effective way to apply styles to an HTMLElement
      // $FlowFixMe[cannot-write]


      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name) {
        var value = attributes[name];

        if (value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value === true ? '' : value);
        }
      });
    });
  }

  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }

    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

        var style = styleProperties.reduce(function (style, property) {
          style[property] = '';
          return style;
        }, {}); // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }

        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  } // eslint-disable-next-line import/no-unused-modules


  var applyStyles$1 = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect$2,
    requires: ['computeStyles']
  };

  function getBasePlacement$1(placement) {
    return placement.split('-')[0];
  }

  function getBoundingClientRect(element) {
    var rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      x: rect.left,
      y: rect.top
    };
  }

  // means it doesn't take into account transforms.

  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
    // Fixes https://github.com/popperjs/popper-core/issues/1223

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }

    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }

    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: width,
      height: height
    };
  }

  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

    if (parent.contains(child)) {
      return true;
    } // then fallback to custom implementation with Shadow DOM support
    else if (rootNode && isShadowRoot(rootNode)) {
        var next = child;

        do {
          if (next && parent.isSameNode(next)) {
            return true;
          } // $FlowFixMe[prop-missing]: need a better way to handle this...


          next = next.parentNode || next.host;
        } while (next);
      } // Give up, the result is false


    return false;
  }

  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }

  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }

  function getDocumentElement(element) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return ((isElement$1(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
  }

  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }

    return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || ( // DOM Element detected
      isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element) // fallback

    );
  }

  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle(element).position === 'fixed') {
      return null;
    }

    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements
  // return the containing block


  function getContainingBlock(element) {
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
    var isIE = navigator.userAgent.indexOf('Trident') !== -1;

    if (isIE && isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      var elementCss = getComputedStyle(element);

      if (elementCss.position === 'fixed') {
        return null;
      }
    }

    var currentNode = getParentNode(element);

    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle(currentNode); // This is non-exhaustive but covers the most common CSS properties that
      // create a containing block.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.


  function getOffsetParent(element) {
    var window = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);

    while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }

    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
      return window;
    }

    return offsetParent || getContainingBlock(element) || window;
  }

  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }

  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }

  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  var toPaddingObject = function toPaddingObject(padding, state) {
    padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };

  function arrow(_ref) {
    var _state$modifiersData$;

    var state = _ref.state,
        name = _ref.name,
        options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement$1(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';

    if (!arrowElement || !popperOffsets) {
      return;
    }

    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
    var startDiff = popperOffsets[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds

    var min = paddingObject[minProp];
    var max = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset = within(min, center, max); // Prevents breaking syntax highlighting...

    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
  }

  function effect$1(_ref2) {
    var state = _ref2.state,
        options = _ref2.options;
    var _options$element = options.element,
        arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

    if (arrowElement == null) {
      return;
    } // CSS selector


    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);

      if (!arrowElement) {
        return;
      }
    }

    if (!contains(state.elements.popper, arrowElement)) {

      return;
    }

    state.elements.arrow = arrowElement;
  } // eslint-disable-next-line import/no-unused-modules


  var arrow$1 = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect$1,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow']
  };

  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.
  // Zooming can change the DPR, but it seems to report a value that will
  // cleanly divide the values into the appropriate subpixels.

  function roundOffsetsByDPR(_ref) {
    var x = _ref.x,
        y = _ref.y;
    var win = window;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(round(x * dpr) / dpr) || 0,
      y: round(round(y * dpr) / dpr) || 0
    };
  }

  function mapToStyles(_ref2) {
    var _Object$assign2;

    var popper = _ref2.popper,
        popperRect = _ref2.popperRect,
        placement = _ref2.placement,
        offsets = _ref2.offsets,
        position = _ref2.position,
        gpuAcceleration = _ref2.gpuAcceleration,
        adaptive = _ref2.adaptive,
        roundOffsets = _ref2.roundOffsets;

    var _ref3 = roundOffsets === true ? roundOffsetsByDPR(offsets) : typeof roundOffsets === 'function' ? roundOffsets(offsets) : offsets,
        _ref3$x = _ref3.x,
        x = _ref3$x === void 0 ? 0 : _ref3$x,
        _ref3$y = _ref3.y,
        y = _ref3$y === void 0 ? 0 : _ref3$y;

    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;

    if (adaptive) {
      var offsetParent = getOffsetParent(popper);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';

      if (offsetParent === getWindow(popper)) {
        offsetParent = getDocumentElement(popper);

        if (getComputedStyle(offsetParent).position !== 'static') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


      offsetParent = offsetParent;

      if (placement === top) {
        sideY = bottom; // $FlowFixMe[prop-missing]

        y -= offsetParent[heightProp] - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }

      if (placement === left) {
        sideX = right; // $FlowFixMe[prop-missing]

        x -= offsetParent[widthProp] - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }

    var commonStyles = Object.assign({
      position: position
    }, adaptive && unsetSides);

    if (gpuAcceleration) {
      var _Object$assign;

      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) < 2 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }

    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
  }

  function computeStyles(_ref4) {
    var state = _ref4.state,
        options = _ref4.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
        gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
        _options$adaptive = options.adaptive,
        adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
        _options$roundOffsets = options.roundOffsets,
        roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;

    var commonStyles = {
      placement: getBasePlacement$1(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration: gpuAcceleration
    };

    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive: adaptive,
        roundOffsets: roundOffsets
      })));
    }

    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets: roundOffsets
      })));
    }

    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var computeStyles$1 = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {}
  };

  var passive = {
    passive: true
  };

  function effect(_ref) {
    var state = _ref.state,
        instance = _ref.instance,
        options = _ref.options;
    var _options$scroll = options.scroll,
        scroll = _options$scroll === void 0 ? true : _options$scroll,
        _options$resize = options.resize,
        resize = _options$resize === void 0 ? true : _options$resize;
    var window = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.addEventListener('resize', instance.update, passive);
    }

    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.removeEventListener('resize', instance.update, passive);
      }
    };
  } // eslint-disable-next-line import/no-unused-modules


  var eventListeners = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect,
    data: {}
  };

  var hash$1 = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash$1[matched];
    });
  }

  var hash = {
    start: 'end',
    end: 'start'
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash[matched];
    });
  }

  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft: scrollLeft,
      scrollTop: scrollTop
    };
  }

  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    // Popper 1 is broken in this case and never had a bug report so let's assume
    // it's not an issue. I don't think anyone ever specifies width on <html>
    // anyway.
    // Browsers where the left scrollbar doesn't cause an issue report `0` for
    // this (e.g. Edge 2019, IE11, Safari)
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  function getViewportRect(element) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0; // NB: This isn't supported on iOS <= 12. If the keyboard is open, the popper
    // can be obscured underneath it.
    // Also, `html.clientHeight` adds the bottom bar height in Safari iOS, even
    // if it isn't open, so if this isn't available, the popper will be detected
    // to overflow the bottom of the screen too early.

    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height; // Uses Layout Viewport (like Chrome; Safari does not currently)
      // In Chrome, it returns a value very close to 0 (+/-) but contains rounding
      // errors due to floating point numbers, so we need to check precision.
      // Safari returns a number <= 0, usually < -1 when pinch-zoomed
      // Feature detection fails in mobile emulation mode in Chrome.
      // Math.abs(win.innerWidth / visualViewport.scale - visualViewport.width) <
      // 0.001
      // Fallback here: "Not Safari" userAgent

      if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }

    return {
      width: width,
      height: height,
      x: x + getWindowScrollBarX(element),
      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  function getDocumentRect(element) {
    var _element$ownerDocumen;

    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;

    if (getComputedStyle(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }

    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }

  function isScrollParent(element) {
    // Firefox wants us to check `-x` and `-y` variations as well
    var _getComputedStyle = getComputedStyle(element),
        overflow = _getComputedStyle.overflow,
        overflowX = _getComputedStyle.overflowX,
        overflowY = _getComputedStyle.overflowY;

    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return node.ownerDocument.body;
    }

    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }

    return getScrollParent(getParentNode(node));
  }

  /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */

  function listScrollParents(element, list) {
    var _element$ownerDocumen;

    if (list === void 0) {
      list = [];
    }

    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)));
  }

  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  function getInnerBoundingClientRect(element) {
    var rect = getBoundingClientRect(element);
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }

  function getClientRectFromMixedType(element, clippingParent) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isHTMLElement(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  } // A "clipping parent" is an overflowable container with the characteristic of
  // clipping (or hiding) overflowing elements with a position different from
  // `initial`


  function getClippingParents(element) {
    var clippingParents = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

    if (!isElement$1(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


    return clippingParents.filter(function (clippingParent) {
      return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
    });
  } // Gets the maximum area that the element is visible in due to any number of
  // clipping parents


  function getClippingRect(element, boundary, rootBoundary) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents[0];
    var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  function getVariation(placement) {
    return placement.split('-')[1];
  }

  function computeOffsets(_ref) {
    var reference = _ref.reference,
        element = _ref.element,
        placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement$1(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference.x + reference.width / 2 - element.width / 2;
    var commonY = reference.y + reference.height / 2 - element.height / 2;
    var offsets;

    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference.y - element.height
        };
        break;

      case bottom:
        offsets = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;

      case right:
        offsets = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;

      case left:
        offsets = {
          x: reference.x - element.width,
          y: commonY
        };
        break;

      default:
        offsets = {
          x: reference.x,
          y: reference.y
        };
    }

    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';

      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
          break;

        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
          break;
      }
    }

    return offsets;
  }

  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$placement = _options.placement,
        placement = _options$placement === void 0 ? state.placement : _options$placement,
        _options$boundary = _options.boundary,
        boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
        _options$rootBoundary = _options.rootBoundary,
        rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
        _options$elementConte = _options.elementContext,
        elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
        _options$altBoundary = _options.altBoundary,
        altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
        _options$padding = _options.padding,
        padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var referenceElement = state.elements.reference;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement$1(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
    var referenceClientRect = getBoundingClientRect(referenceElement);
    var popperOffsets = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: 'absolute',
      placement: placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
    // 0 or negative = within the clipping rect

    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

    if (elementContext === popper && offsetData) {
      var offset = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset[axis] * multiply;
      });
    }

    return overflowOffsets;
  }

  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        placement = _options.placement,
        boundary = _options.boundary,
        rootBoundary = _options.rootBoundary,
        padding = _options.padding,
        flipVariations = _options.flipVariations,
        _options$allowedAutoP = _options.allowedAutoPlacements,
        allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
      return getVariation(placement) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function (placement) {
      return allowedAutoPlacements.indexOf(placement) >= 0;
    });

    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


    var overflows = allowedPlacements.reduce(function (acc, placement) {
      acc[placement] = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding
      })[getBasePlacement$1(placement)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }

  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement$1(placement) === auto) {
      return [];
    }

    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }

  function flip(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;

    if (state.modifiersData[name]._skip) {
      return;
    }

    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
        specifiedFallbackPlacements = options.fallbackPlacements,
        padding = options.padding,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        _options$flipVariatio = options.flipVariations,
        flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
        allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement$1(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
      return acc.concat(getBasePlacement$1(placement) === auto ? computeAutoPlacement(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        flipVariations: flipVariations,
        allowedAutoPlacements: allowedAutoPlacements
      }) : placement);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements[0];

    for (var i = 0; i < placements.length; i++) {
      var placement = placements[i];

      var _basePlacement = getBasePlacement$1(placement);

      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        altBoundary: altBoundary,
        padding: padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }

      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];

      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }

      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }

      if (checks.every(function (check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }

      checksMap.set(placement, checks);
    }

    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later
      var numberOfChecks = flipVariations ? 3 : 1;

      var _loop = function _loop(_i) {
        var fittingPlacement = placements.find(function (placement) {
          var checks = checksMap.get(placement);

          if (checks) {
            return checks.slice(0, _i).every(function (check) {
              return check;
            });
          }
        });

        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };

      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);

        if (_ret === "break") break;
      }
    }

    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  } // eslint-disable-next-line import/no-unused-modules


  var flip$1 = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false
    }
  };

  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }

    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }

  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }

  function hide(_ref) {
    var state = _ref.state,
        name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference'
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,
      popperEscapeOffsets: popperEscapeOffsets,
      isReferenceHidden: isReferenceHidden,
      hasPopperEscaped: hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped
    });
  } // eslint-disable-next-line import/no-unused-modules


  var hide$1 = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide
  };

  function distanceAndSkiddingToXY(placement, rects, offset) {
    var basePlacement = getBasePlacement$1(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

    var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
      placement: placement
    })) : offset,
        skidding = _ref[0],
        distance = _ref[1];

    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }

  function offset(_ref2) {
    var state = _ref2.state,
        options = _ref2.options,
        name = _ref2.name;
    var _options$offset = options.offset,
        offset = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement],
        x = _data$state$placement.x,
        y = _data$state$placement.y;

    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var offset$1 = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset
  };

  function popperOffsets(_ref) {
    var state = _ref.state,
        name = _ref.name;
    // Offsets are the actual position the popper needs to have to be
    // properly positioned near its reference element
    // This is the most basic placement, and will be adjusted by
    // the modifiers in the next step
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: 'absolute',
      placement: state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  var popperOffsets$1 = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {}
  };

  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  function preventOverflow(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;
    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        padding = options.padding,
        _options$tether = options.tether,
        tether = _options$tether === void 0 ? true : _options$tether,
        _options$tetherOffset = options.tetherOffset,
        tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      altBoundary: altBoundary
    });
    var basePlacement = getBasePlacement$1(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var data = {
      x: 0,
      y: 0
    };

    if (!popperOffsets) {
      return;
    }

    if (checkMainAxis || checkAltAxis) {
      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset = popperOffsets[mainAxis];
      var min$1 = popperOffsets[mainAxis] + overflow[mainSide];
      var max$1 = popperOffsets[mainAxis] - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
      // outside the reference bounds

      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
      // to include its full size in the calculation. If the reference is small
      // and near the edge of a boundary, the popper can overflow even if the
      // reference is not overflowing as well (e.g. virtual elements with no
      // width or height)

      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - tetherOffsetValue : minLen - arrowLen - arrowPaddingMin - tetherOffsetValue;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + tetherOffsetValue : maxLen + arrowLen + arrowPaddingMax + tetherOffsetValue;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = state.modifiersData.offset ? state.modifiersData.offset[state.placement][mainAxis] : 0;
      var tetherMin = popperOffsets[mainAxis] + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = popperOffsets[mainAxis] + maxOffset - offsetModifierValue;

      if (checkMainAxis) {
        var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
        popperOffsets[mainAxis] = preventedOffset;
        data[mainAxis] = preventedOffset - offset;
      }

      if (checkAltAxis) {
        var _mainSide = mainAxis === 'x' ? top : left;

        var _altSide = mainAxis === 'x' ? bottom : right;

        var _offset = popperOffsets[altAxis];

        var _min = _offset + overflow[_mainSide];

        var _max = _offset - overflow[_altSide];

        var _preventedOffset = within(tether ? min(_min, tetherMin) : _min, _offset, tether ? max(_max, tetherMax) : _max);

        popperOffsets[altAxis] = _preventedOffset;
        data[altAxis] = _preventedOffset - _offset;
      }
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  var preventOverflow$1 = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset']
  };

  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  // Composite means it takes into account transforms as well as layout.

  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }

    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement);
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };

    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }

      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }

    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  function order(modifiers) {
    var map = new Map();
    var visited = new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);

          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }

    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        // check for visited object
        sort(modifier);
      }
    });
    return result;
  }

  function orderModifiers(modifiers) {
    // order based on dependencies
    var orderedModifiers = order(modifiers); // order based on phase

    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(orderedModifiers.filter(function (modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  function debounce$1(fn) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = undefined;
            resolve(fn());
          });
        });
      }

      return pending;
    };
  }

  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged, current) {
      var existing = merged[current.name];
      merged[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }
  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute'
  };

  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }

  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }

    var _generatorOptions = generatorOptions,
        _generatorOptions$def = _generatorOptions.defaultModifiers,
        defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
        _generatorOptions$def2 = _generatorOptions.defaultOptions,
        defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper(reference, popper, options) {
      if (options === void 0) {
        options = defaultOptions;
      }

      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference,
          popper: popper
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state: state,
        setOptions: function setOptions(options) {
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options);
          state.scrollParents = {
            reference: isElement$1(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
            popper: listScrollParents(popper)
          }; // Orders the modifiers based on their dependencies and `phase`
          // properties

          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          }); // Validate the provided modifiers so that the consumer will get warned

          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }

          var _state$elements = state.elements,
              reference = _state$elements.reference,
              popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
          // anymore

          if (!areValidElements(reference, popper)) {

            return;
          } // Store the reference and popper rects to be read by modifiers


          state.rects = {
            reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper)
          }; // Modifiers have the ability to reset the current update cycle. The
          // most common use case for this is the `flip` modifier changing the
          // placement, which then needs to re-run all the modifiers, because the
          // logic was previously ran for the previous placement and is therefore
          // stale/incorrect

          state.reset = false;
          state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
          // is filled with the initial data specified by the modifier. This means
          // it doesn't persist and is fresh on each update.
          // To ensure persistent data, use `${name}#persistent`

          state.orderedModifiers.forEach(function (modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });

          for (var index = 0; index < state.orderedModifiers.length; index++) {

            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }

            var _state$orderedModifie = state.orderedModifiers[index],
                fn = _state$orderedModifie.fn,
                _state$orderedModifie2 = _state$orderedModifie.options,
                _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                name = _state$orderedModifie.name;

            if (typeof fn === 'function') {
              state = fn({
                state: state,
                options: _options,
                name: name,
                instance: instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce$1(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };

      if (!areValidElements(reference, popper)) {

        return instance;
      }

      instance.setOptions(options).then(function (state) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state);
        }
      }); // Modifiers have the ability to execute arbitrary code before the first
      // update cycle runs. They will be executed in the same order as the update
      // cycle. This is useful when a modifier adds some persistent data that
      // other modifiers need to use, but the modifier is run after the dependent
      // one.

      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref3) {
          var name = _ref3.name,
              _ref3$options = _ref3.options,
              options = _ref3$options === void 0 ? {} : _ref3$options,
              effect = _ref3.effect;

          if (typeof effect === 'function') {
            var cleanupFn = effect({
              state: state,
              name: name,
              instance: instance,
              options: options
            });

            var noopFn = function noopFn() {};

            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }

      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn) {
          return fn();
        });
        effectCleanupFns = [];
      }

      return instance;
    };
  }

  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers
  }); // eslint-disable-next-line import/no-unused-modules
  var BOX_CLASS = "tippy-box";
  var CONTENT_CLASS = "tippy-content";
  var BACKDROP_CLASS = "tippy-backdrop";
  var ARROW_CLASS = "tippy-arrow";
  var SVG_ARROW_CLASS = "tippy-svg-arrow";
  var TOUCH_OPTIONS = {
    passive: true,
    capture: true
  };
  function getValueAtIndexOrReturn(value, index, defaultValue) {
    if (Array.isArray(value)) {
      var v = value[index];
      return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
    }

    return value;
  }
  function isType(value, type) {
    var str = {}.toString.call(value);
    return str.indexOf('[object') === 0 && str.indexOf(type + "]") > -1;
  }
  function invokeWithArgsOrReturn(value, args) {
    return typeof value === 'function' ? value.apply(void 0, args) : value;
  }
  function debounce(fn, ms) {
    // Avoid wrapping in `setTimeout` if ms is 0 anyway
    if (ms === 0) {
      return fn;
    }

    var timeout;
    return function (arg) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn(arg);
      }, ms);
    };
  }
  function splitBySpaces(value) {
    return value.split(/\s+/).filter(Boolean);
  }
  function normalizeToArray(value) {
    return [].concat(value);
  }
  function pushIfUnique(arr, value) {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  }
  function unique(arr) {
    return arr.filter(function (item, index) {
      return arr.indexOf(item) === index;
    });
  }
  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }
  function arrayFrom(value) {
    return [].slice.call(value);
  }
  function removeUndefinedProps(obj) {
    return Object.keys(obj).reduce(function (acc, key) {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
      }

      return acc;
    }, {});
  }

  function div() {
    return document.createElement('div');
  }
  function isElement(value) {
    return ['Element', 'Fragment'].some(function (type) {
      return isType(value, type);
    });
  }
  function isNodeList(value) {
    return isType(value, 'NodeList');
  }
  function isMouseEvent(value) {
    return isType(value, 'MouseEvent');
  }
  function isReferenceElement(value) {
    return !!(value && value._tippy && value._tippy.reference === value);
  }
  function getArrayOfElements(value) {
    if (isElement(value)) {
      return [value];
    }

    if (isNodeList(value)) {
      return arrayFrom(value);
    }

    if (Array.isArray(value)) {
      return value;
    }

    return arrayFrom(document.querySelectorAll(value));
  }
  function setTransitionDuration(els, value) {
    els.forEach(function (el) {
      if (el) {
        el.style.transitionDuration = value + "ms";
      }
    });
  }
  function setVisibilityState(els, state) {
    els.forEach(function (el) {
      if (el) {
        el.setAttribute('data-state', state);
      }
    });
  }
  function getOwnerDocument(elementOrElements) {
    var _element$ownerDocumen;

    var _normalizeToArray = normalizeToArray(elementOrElements),
        element = _normalizeToArray[0]; // Elements created via a <template> have an ownerDocument with no reference to the body


    return (element == null ? void 0 : (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body) ? element.ownerDocument : document;
  }
  function isCursorOutsideInteractiveBorder(popperTreeData, event) {
    var clientX = event.clientX,
        clientY = event.clientY;
    return popperTreeData.every(function (_ref) {
      var popperRect = _ref.popperRect,
          popperState = _ref.popperState,
          props = _ref.props;
      var interactiveBorder = props.interactiveBorder;
      var basePlacement = getBasePlacement(popperState.placement);
      var offsetData = popperState.modifiersData.offset;

      if (!offsetData) {
        return true;
      }

      var topDistance = basePlacement === 'bottom' ? offsetData.top.y : 0;
      var bottomDistance = basePlacement === 'top' ? offsetData.bottom.y : 0;
      var leftDistance = basePlacement === 'right' ? offsetData.left.x : 0;
      var rightDistance = basePlacement === 'left' ? offsetData.right.x : 0;
      var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
      var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
      var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
      var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
      return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    });
  }
  function updateTransitionEndListener(box, action, listener) {
    var method = action + "EventListener"; // some browsers apparently support `transition` (unprefixed) but only fire
    // `webkitTransitionEnd`...

    ['transitionend', 'webkitTransitionEnd'].forEach(function (event) {
      box[method](event, listener);
    });
  }

  var currentInput = {
    isTouch: false
  };
  var lastMouseMoveTime = 0;
  /**
   * When a `touchstart` event is fired, it's assumed the user is using touch
   * input. We'll bind a `mousemove` event listener to listen for mouse input in
   * the future. This way, the `isTouch` property is fully dynamic and will handle
   * hybrid devices that use a mix of touch + mouse input.
   */

  function onDocumentTouchStart() {
    if (currentInput.isTouch) {
      return;
    }

    currentInput.isTouch = true;

    if (window.performance) {
      document.addEventListener('mousemove', onDocumentMouseMove);
    }
  }
  /**
   * When two `mousemove` event are fired consecutively within 20ms, it's assumed
   * the user is using mouse input again. `mousemove` can fire on touch devices as
   * well, but very rarely that quickly.
   */

  function onDocumentMouseMove() {
    var now = performance.now();

    if (now - lastMouseMoveTime < 20) {
      currentInput.isTouch = false;
      document.removeEventListener('mousemove', onDocumentMouseMove);
    }

    lastMouseMoveTime = now;
  }
  /**
   * When an element is in focus and has a tippy, leaving the tab/window and
   * returning causes it to show again. For mouse users this is unexpected, but
   * for keyboard use it makes sense.
   * TODO: find a better technique to solve this problem
   */

  function onWindowBlur() {
    var activeElement = document.activeElement;

    if (isReferenceElement(activeElement)) {
      var instance = activeElement._tippy;

      if (activeElement.blur && !instance.state.isVisible) {
        activeElement.blur();
      }
    }
  }
  function bindGlobalEventListeners() {
    document.addEventListener('touchstart', onDocumentTouchStart, TOUCH_OPTIONS);
    window.addEventListener('blur', onWindowBlur);
  }

  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  var ua = isBrowser ? navigator.userAgent : '';
  var isIE = /MSIE |Trident\//.test(ua);

  var pluginProps = {
    animateFill: false,
    followCursor: false,
    inlinePositioning: false,
    sticky: false
  };
  var renderProps = {
    allowHTML: false,
    animation: 'fade',
    arrow: true,
    content: '',
    inertia: false,
    maxWidth: 350,
    role: 'tooltip',
    theme: '',
    zIndex: 9999
  };
  var defaultProps = Object.assign({
    appendTo: function appendTo() {
      return document.body;
    },
    aria: {
      content: 'auto',
      expanded: 'auto'
    },
    delay: 0,
    duration: [300, 250],
    getReferenceClientRect: null,
    hideOnClick: true,
    ignoreAttributes: false,
    interactive: false,
    interactiveBorder: 2,
    interactiveDebounce: 0,
    moveTransition: '',
    offset: [0, 10],
    onAfterUpdate: function onAfterUpdate() {},
    onBeforeUpdate: function onBeforeUpdate() {},
    onCreate: function onCreate() {},
    onDestroy: function onDestroy() {},
    onHidden: function onHidden() {},
    onHide: function onHide() {},
    onMount: function onMount() {},
    onShow: function onShow() {},
    onShown: function onShown() {},
    onTrigger: function onTrigger() {},
    onUntrigger: function onUntrigger() {},
    onClickOutside: function onClickOutside() {},
    placement: 'top',
    plugins: [],
    popperOptions: {},
    render: null,
    showOnCreate: false,
    touch: true,
    trigger: 'mouseenter focus',
    triggerTarget: null
  }, pluginProps, {}, renderProps);
  var defaultKeys = Object.keys(defaultProps);
  var setDefaultProps = function setDefaultProps(partialProps) {

    var keys = Object.keys(partialProps);
    keys.forEach(function (key) {
      defaultProps[key] = partialProps[key];
    });
  };
  function getExtendedPassedProps(passedProps) {
    var plugins = passedProps.plugins || [];
    var pluginProps = plugins.reduce(function (acc, plugin) {
      var name = plugin.name,
          defaultValue = plugin.defaultValue;

      if (name) {
        acc[name] = passedProps[name] !== undefined ? passedProps[name] : defaultValue;
      }

      return acc;
    }, {});
    return Object.assign({}, passedProps, {}, pluginProps);
  }
  function getDataAttributeProps(reference, plugins) {
    var propKeys = plugins ? Object.keys(getExtendedPassedProps(Object.assign({}, defaultProps, {
      plugins: plugins
    }))) : defaultKeys;
    var props = propKeys.reduce(function (acc, key) {
      var valueAsString = (reference.getAttribute("data-tippy-" + key) || '').trim();

      if (!valueAsString) {
        return acc;
      }

      if (key === 'content') {
        acc[key] = valueAsString;
      } else {
        try {
          acc[key] = JSON.parse(valueAsString);
        } catch (e) {
          acc[key] = valueAsString;
        }
      }

      return acc;
    }, {});
    return props;
  }
  function evaluateProps(reference, props) {
    var out = Object.assign({}, props, {
      content: invokeWithArgsOrReturn(props.content, [reference])
    }, props.ignoreAttributes ? {} : getDataAttributeProps(reference, props.plugins));
    out.aria = Object.assign({}, defaultProps.aria, {}, out.aria);
    out.aria = {
      expanded: out.aria.expanded === 'auto' ? props.interactive : out.aria.expanded,
      content: out.aria.content === 'auto' ? props.interactive ? null : 'describedby' : out.aria.content
    };
    return out;
  }

  var innerHTML = function innerHTML() {
    return 'innerHTML';
  };

  function dangerouslySetInnerHTML(element, html) {
    element[innerHTML()] = html;
  }

  function createArrowElement(value) {
    var arrow = div();

    if (value === true) {
      arrow.className = ARROW_CLASS;
    } else {
      arrow.className = SVG_ARROW_CLASS;

      if (isElement(value)) {
        arrow.appendChild(value);
      } else {
        dangerouslySetInnerHTML(arrow, value);
      }
    }

    return arrow;
  }

  function setContent(content, props) {
    if (isElement(props.content)) {
      dangerouslySetInnerHTML(content, '');
      content.appendChild(props.content);
    } else if (typeof props.content !== 'function') {
      if (props.allowHTML) {
        dangerouslySetInnerHTML(content, props.content);
      } else {
        content.textContent = props.content;
      }
    }
  }
  function getChildren(popper) {
    var box = popper.firstElementChild;
    var boxChildren = arrayFrom(box.children);
    return {
      box: box,
      content: boxChildren.find(function (node) {
        return node.classList.contains(CONTENT_CLASS);
      }),
      arrow: boxChildren.find(function (node) {
        return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
      }),
      backdrop: boxChildren.find(function (node) {
        return node.classList.contains(BACKDROP_CLASS);
      })
    };
  }
  function render(instance) {
    var popper = div();
    var box = div();
    box.className = BOX_CLASS;
    box.setAttribute('data-state', 'hidden');
    box.setAttribute('tabindex', '-1');
    var content = div();
    content.className = CONTENT_CLASS;
    content.setAttribute('data-state', 'hidden');
    setContent(content, instance.props);
    popper.appendChild(box);
    box.appendChild(content);
    onUpdate(instance.props, instance.props);

    function onUpdate(prevProps, nextProps) {
      var _getChildren = getChildren(popper),
          box = _getChildren.box,
          content = _getChildren.content,
          arrow = _getChildren.arrow;

      if (nextProps.theme) {
        box.setAttribute('data-theme', nextProps.theme);
      } else {
        box.removeAttribute('data-theme');
      }

      if (typeof nextProps.animation === 'string') {
        box.setAttribute('data-animation', nextProps.animation);
      } else {
        box.removeAttribute('data-animation');
      }

      if (nextProps.inertia) {
        box.setAttribute('data-inertia', '');
      } else {
        box.removeAttribute('data-inertia');
      }

      box.style.maxWidth = typeof nextProps.maxWidth === 'number' ? nextProps.maxWidth + "px" : nextProps.maxWidth;

      if (nextProps.role) {
        box.setAttribute('role', nextProps.role);
      } else {
        box.removeAttribute('role');
      }

      if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
        setContent(content, instance.props);
      }

      if (nextProps.arrow) {
        if (!arrow) {
          box.appendChild(createArrowElement(nextProps.arrow));
        } else if (prevProps.arrow !== nextProps.arrow) {
          box.removeChild(arrow);
          box.appendChild(createArrowElement(nextProps.arrow));
        }
      } else if (arrow) {
        box.removeChild(arrow);
      }
    }

    return {
      popper: popper,
      onUpdate: onUpdate
    };
  } // Runtime check to identify if the render function is the default one; this
  // way we can apply default CSS transitions logic and it can be tree-shaken away

  render.$$tippy = true;

  var idCounter = 1;
  var mouseMoveListeners = []; // Used by `hideAll()`

  var mountedInstances = [];
  function createTippy(reference, passedProps) {
    var props = evaluateProps(reference, Object.assign({}, defaultProps, {}, getExtendedPassedProps(removeUndefinedProps(passedProps)))); // ===========================================================================
    // 🔒 Private members
    // ===========================================================================

    var showTimeout;
    var hideTimeout;
    var scheduleHideAnimationFrame;
    var isVisibleFromClick = false;
    var didHideDueToDocumentMouseDown = false;
    var didTouchMove = false;
    var ignoreOnFirstUpdate = false;
    var lastTriggerEvent;
    var currentTransitionEndListener;
    var onFirstUpdate;
    var listeners = [];
    var debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
    var currentTarget; // ===========================================================================
    // 🔑 Public members
    // ===========================================================================

    var id = idCounter++;
    var popperInstance = null;
    var plugins = unique(props.plugins);
    var state = {
      // Is the instance currently enabled?
      isEnabled: true,
      // Is the tippy currently showing and not transitioning out?
      isVisible: false,
      // Has the instance been destroyed?
      isDestroyed: false,
      // Is the tippy currently mounted to the DOM?
      isMounted: false,
      // Has the tippy finished transitioning in?
      isShown: false
    };
    var instance = {
      // properties
      id: id,
      reference: reference,
      popper: div(),
      popperInstance: popperInstance,
      props: props,
      state: state,
      plugins: plugins,
      // methods
      clearDelayTimeouts: clearDelayTimeouts,
      setProps: setProps,
      setContent: setContent,
      show: show,
      hide: hide,
      hideWithInteractivity: hideWithInteractivity,
      enable: enable,
      disable: disable,
      unmount: unmount,
      destroy: destroy
    }; // TODO: Investigate why this early return causes a TDZ error in the tests —
    // it doesn't seem to happen in the browser

    /* istanbul ignore if */

    if (!props.render) {

      return instance;
    } // ===========================================================================
    // Initial mutations
    // ===========================================================================


    var _props$render = props.render(instance),
        popper = _props$render.popper,
        onUpdate = _props$render.onUpdate;

    popper.setAttribute('data-tippy-root', '');
    popper.id = "tippy-" + instance.id;
    instance.popper = popper;
    reference._tippy = instance;
    popper._tippy = instance;
    var pluginsHooks = plugins.map(function (plugin) {
      return plugin.fn(instance);
    });
    var hasAriaExpanded = reference.hasAttribute('aria-expanded');
    addListeners();
    handleAriaExpandedAttribute();
    handleStyles();
    invokeHook('onCreate', [instance]);

    if (props.showOnCreate) {
      scheduleShow();
    } // Prevent a tippy with a delay from hiding if the cursor left then returned
    // before it started hiding


    popper.addEventListener('mouseenter', function () {
      if (instance.props.interactive && instance.state.isVisible) {
        instance.clearDelayTimeouts();
      }
    });
    popper.addEventListener('mouseleave', function (event) {
      if (instance.props.interactive && instance.props.trigger.indexOf('mouseenter') >= 0) {
        getDocument().addEventListener('mousemove', debouncedOnMouseMove);
        debouncedOnMouseMove(event);
      }
    });
    return instance; // ===========================================================================
    // 🔒 Private methods
    // ===========================================================================

    function getNormalizedTouchSettings() {
      var touch = instance.props.touch;
      return Array.isArray(touch) ? touch : [touch, 0];
    }

    function getIsCustomTouchBehavior() {
      return getNormalizedTouchSettings()[0] === 'hold';
    }

    function getIsDefaultRenderFn() {
      var _instance$props$rende;

      // @ts-ignore
      return !!((_instance$props$rende = instance.props.render) == null ? void 0 : _instance$props$rende.$$tippy);
    }

    function getCurrentTarget() {
      return currentTarget || reference;
    }

    function getDocument() {
      var parent = getCurrentTarget().parentNode;
      return parent ? getOwnerDocument(parent) : document;
    }

    function getDefaultTemplateChildren() {
      return getChildren(popper);
    }

    function getDelay(isShow) {
      // For touch or keyboard input, force `0` delay for UX reasons
      // Also if the instance is mounted but not visible (transitioning out),
      // ignore delay
      if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === 'focus') {
        return 0;
      }

      return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
    }

    function handleStyles() {
      popper.style.pointerEvents = instance.props.interactive && instance.state.isVisible ? '' : 'none';
      popper.style.zIndex = "" + instance.props.zIndex;
    }

    function invokeHook(hook, args, shouldInvokePropsHook) {
      if (shouldInvokePropsHook === void 0) {
        shouldInvokePropsHook = true;
      }

      pluginsHooks.forEach(function (pluginHooks) {
        if (pluginHooks[hook]) {
          pluginHooks[hook].apply(void 0, args);
        }
      });

      if (shouldInvokePropsHook) {
        var _instance$props;

        (_instance$props = instance.props)[hook].apply(_instance$props, args);
      }
    }

    function handleAriaContentAttribute() {
      var aria = instance.props.aria;

      if (!aria.content) {
        return;
      }

      var attr = "aria-" + aria.content;
      var id = popper.id;
      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        var currentValue = node.getAttribute(attr);

        if (instance.state.isVisible) {
          node.setAttribute(attr, currentValue ? currentValue + " " + id : id);
        } else {
          var nextValue = currentValue && currentValue.replace(id, '').trim();

          if (nextValue) {
            node.setAttribute(attr, nextValue);
          } else {
            node.removeAttribute(attr);
          }
        }
      });
    }

    function handleAriaExpandedAttribute() {
      if (hasAriaExpanded || !instance.props.aria.expanded) {
        return;
      }

      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        if (instance.props.interactive) {
          node.setAttribute('aria-expanded', instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false');
        } else {
          node.removeAttribute('aria-expanded');
        }
      });
    }

    function cleanupInteractiveMouseListeners() {
      getDocument().removeEventListener('mousemove', debouncedOnMouseMove);
      mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
        return listener !== debouncedOnMouseMove;
      });
    }

    function onDocumentPress(event) {
      // Moved finger to scroll instead of an intentional tap outside
      if (currentInput.isTouch) {
        if (didTouchMove || event.type === 'mousedown') {
          return;
        }
      } // Clicked on interactive popper


      if (instance.props.interactive && popper.contains(event.target)) {
        return;
      } // Clicked on the event listeners target


      if (getCurrentTarget().contains(event.target)) {
        if (currentInput.isTouch) {
          return;
        }

        if (instance.state.isVisible && instance.props.trigger.indexOf('click') >= 0) {
          return;
        }
      } else {
        invokeHook('onClickOutside', [instance, event]);
      }

      if (instance.props.hideOnClick === true) {
        instance.clearDelayTimeouts();
        instance.hide(); // `mousedown` event is fired right before `focus` if pressing the
        // currentTarget. This lets a tippy with `focus` trigger know that it
        // should not show

        didHideDueToDocumentMouseDown = true;
        setTimeout(function () {
          didHideDueToDocumentMouseDown = false;
        }); // The listener gets added in `scheduleShow()`, but this may be hiding it
        // before it shows, and hide()'s early bail-out behavior can prevent it
        // from being cleaned up

        if (!instance.state.isMounted) {
          removeDocumentPress();
        }
      }
    }

    function onTouchMove() {
      didTouchMove = true;
    }

    function onTouchStart() {
      didTouchMove = false;
    }

    function addDocumentPress() {
      var doc = getDocument();
      doc.addEventListener('mousedown', onDocumentPress, true);
      doc.addEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
      doc.addEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
      doc.addEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
    }

    function removeDocumentPress() {
      var doc = getDocument();
      doc.removeEventListener('mousedown', onDocumentPress, true);
      doc.removeEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
      doc.removeEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
      doc.removeEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
    }

    function onTransitionedOut(duration, callback) {
      onTransitionEnd(duration, function () {
        if (!instance.state.isVisible && popper.parentNode && popper.parentNode.contains(popper)) {
          callback();
        }
      });
    }

    function onTransitionedIn(duration, callback) {
      onTransitionEnd(duration, callback);
    }

    function onTransitionEnd(duration, callback) {
      var box = getDefaultTemplateChildren().box;

      function listener(event) {
        if (event.target === box) {
          updateTransitionEndListener(box, 'remove', listener);
          callback();
        }
      } // Make callback synchronous if duration is 0
      // `transitionend` won't fire otherwise


      if (duration === 0) {
        return callback();
      }

      updateTransitionEndListener(box, 'remove', currentTransitionEndListener);
      updateTransitionEndListener(box, 'add', listener);
      currentTransitionEndListener = listener;
    }

    function on(eventType, handler, options) {
      if (options === void 0) {
        options = false;
      }

      var nodes = normalizeToArray(instance.props.triggerTarget || reference);
      nodes.forEach(function (node) {
        node.addEventListener(eventType, handler, options);
        listeners.push({
          node: node,
          eventType: eventType,
          handler: handler,
          options: options
        });
      });
    }

    function addListeners() {
      if (getIsCustomTouchBehavior()) {
        on('touchstart', onTrigger, {
          passive: true
        });
        on('touchend', onMouseLeave, {
          passive: true
        });
      }

      splitBySpaces(instance.props.trigger).forEach(function (eventType) {
        if (eventType === 'manual') {
          return;
        }

        on(eventType, onTrigger);

        switch (eventType) {
          case 'mouseenter':
            on('mouseleave', onMouseLeave);
            break;

          case 'focus':
            on(isIE ? 'focusout' : 'blur', onBlurOrFocusOut);
            break;

          case 'focusin':
            on('focusout', onBlurOrFocusOut);
            break;
        }
      });
    }

    function removeListeners() {
      listeners.forEach(function (_ref) {
        var node = _ref.node,
            eventType = _ref.eventType,
            handler = _ref.handler,
            options = _ref.options;
        node.removeEventListener(eventType, handler, options);
      });
      listeners = [];
    }

    function onTrigger(event) {
      var _lastTriggerEvent;

      var shouldScheduleClickHide = false;

      if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
        return;
      }

      var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === 'focus';
      lastTriggerEvent = event;
      currentTarget = event.currentTarget;
      handleAriaExpandedAttribute();

      if (!instance.state.isVisible && isMouseEvent(event)) {
        // If scrolling, `mouseenter` events can be fired if the cursor lands
        // over a new target, but `mousemove` events don't get fired. This
        // causes interactive tooltips to get stuck open until the cursor is
        // moved
        mouseMoveListeners.forEach(function (listener) {
          return listener(event);
        });
      } // Toggle show/hide when clicking click-triggered tooltips


      if (event.type === 'click' && (instance.props.trigger.indexOf('mouseenter') < 0 || isVisibleFromClick) && instance.props.hideOnClick !== false && instance.state.isVisible) {
        shouldScheduleClickHide = true;
      } else {
        scheduleShow(event);
      }

      if (event.type === 'click') {
        isVisibleFromClick = !shouldScheduleClickHide;
      }

      if (shouldScheduleClickHide && !wasFocused) {
        scheduleHide(event);
      }
    }

    function onMouseMove(event) {
      var target = event.target;
      var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target) || popper.contains(target);

      if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
        return;
      }

      var popperTreeData = getNestedPopperTree().concat(popper).map(function (popper) {
        var _instance$popperInsta;

        var instance = popper._tippy;
        var state = (_instance$popperInsta = instance.popperInstance) == null ? void 0 : _instance$popperInsta.state;

        if (state) {
          return {
            popperRect: popper.getBoundingClientRect(),
            popperState: state,
            props: props
          };
        }

        return null;
      }).filter(Boolean);

      if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
        cleanupInteractiveMouseListeners();
        scheduleHide(event);
      }
    }

    function onMouseLeave(event) {
      var shouldBail = isEventListenerStopped(event) || instance.props.trigger.indexOf('click') >= 0 && isVisibleFromClick;

      if (shouldBail) {
        return;
      }

      if (instance.props.interactive) {
        instance.hideWithInteractivity(event);
        return;
      }

      scheduleHide(event);
    }

    function onBlurOrFocusOut(event) {
      if (instance.props.trigger.indexOf('focusin') < 0 && event.target !== getCurrentTarget()) {
        return;
      } // If focus was moved to within the popper


      if (instance.props.interactive && event.relatedTarget && popper.contains(event.relatedTarget)) {
        return;
      }

      scheduleHide(event);
    }

    function isEventListenerStopped(event) {
      return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf('touch') >= 0 : false;
    }

    function createPopperInstance() {
      destroyPopperInstance();
      var _instance$props2 = instance.props,
          popperOptions = _instance$props2.popperOptions,
          placement = _instance$props2.placement,
          offset = _instance$props2.offset,
          getReferenceClientRect = _instance$props2.getReferenceClientRect,
          moveTransition = _instance$props2.moveTransition;
      var arrow = getIsDefaultRenderFn() ? getChildren(popper).arrow : null;
      var computedReference = getReferenceClientRect ? {
        getBoundingClientRect: getReferenceClientRect,
        contextElement: getReferenceClientRect.contextElement || getCurrentTarget()
      } : reference;
      var tippyModifier = {
        name: '$$tippy',
        enabled: true,
        phase: 'beforeWrite',
        requires: ['computeStyles'],
        fn: function fn(_ref2) {
          var state = _ref2.state;

          if (getIsDefaultRenderFn()) {
            var _getDefaultTemplateCh = getDefaultTemplateChildren(),
                box = _getDefaultTemplateCh.box;

            ['placement', 'reference-hidden', 'escaped'].forEach(function (attr) {
              if (attr === 'placement') {
                box.setAttribute('data-placement', state.placement);
              } else {
                if (state.attributes.popper["data-popper-" + attr]) {
                  box.setAttribute("data-" + attr, '');
                } else {
                  box.removeAttribute("data-" + attr);
                }
              }
            });
            state.attributes.popper = {};
          }
        }
      };
      var modifiers = [{
        name: 'offset',
        options: {
          offset: offset
        }
      }, {
        name: 'preventOverflow',
        options: {
          padding: {
            top: 2,
            bottom: 2,
            left: 5,
            right: 5
          }
        }
      }, {
        name: 'flip',
        options: {
          padding: 5
        }
      }, {
        name: 'computeStyles',
        options: {
          adaptive: !moveTransition
        }
      }, tippyModifier];

      if (getIsDefaultRenderFn() && arrow) {
        modifiers.push({
          name: 'arrow',
          options: {
            element: arrow,
            padding: 3
          }
        });
      }

      modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
      instance.popperInstance = createPopper(computedReference, popper, Object.assign({}, popperOptions, {
        placement: placement,
        onFirstUpdate: onFirstUpdate,
        modifiers: modifiers
      }));
    }

    function destroyPopperInstance() {
      if (instance.popperInstance) {
        instance.popperInstance.destroy();
        instance.popperInstance = null;
      }
    }

    function mount() {
      var appendTo = instance.props.appendTo;
      var parentNode; // By default, we'll append the popper to the triggerTargets's parentNode so
      // it's directly after the reference element so the elements inside the
      // tippy can be tabbed to
      // If there are clipping issues, the user can specify a different appendTo
      // and ensure focus management is handled correctly manually

      var node = getCurrentTarget();

      if (instance.props.interactive && appendTo === defaultProps.appendTo || appendTo === 'parent') {
        parentNode = node.parentNode;
      } else {
        parentNode = invokeWithArgsOrReturn(appendTo, [node]);
      } // The popper element needs to exist on the DOM before its position can be
      // updated as Popper needs to read its dimensions


      if (!parentNode.contains(popper)) {
        parentNode.appendChild(popper);
      }

      createPopperInstance();
    }

    function getNestedPopperTree() {
      return arrayFrom(popper.querySelectorAll('[data-tippy-root]'));
    }

    function scheduleShow(event) {
      instance.clearDelayTimeouts();

      if (event) {
        invokeHook('onTrigger', [instance, event]);
      }

      addDocumentPress();
      var delay = getDelay(true);

      var _getNormalizedTouchSe = getNormalizedTouchSettings(),
          touchValue = _getNormalizedTouchSe[0],
          touchDelay = _getNormalizedTouchSe[1];

      if (currentInput.isTouch && touchValue === 'hold' && touchDelay) {
        delay = touchDelay;
      }

      if (delay) {
        showTimeout = setTimeout(function () {
          instance.show();
        }, delay);
      } else {
        instance.show();
      }
    }

    function scheduleHide(event) {
      instance.clearDelayTimeouts();
      invokeHook('onUntrigger', [instance, event]);

      if (!instance.state.isVisible) {
        removeDocumentPress();
        return;
      } // For interactive tippies, scheduleHide is added to a document.body handler
      // from onMouseLeave so must intercept scheduled hides from mousemove/leave
      // events when trigger contains mouseenter and click, and the tip is
      // currently shown as a result of a click.


      if (instance.props.trigger.indexOf('mouseenter') >= 0 && instance.props.trigger.indexOf('click') >= 0 && ['mouseleave', 'mousemove'].indexOf(event.type) >= 0 && isVisibleFromClick) {
        return;
      }

      var delay = getDelay(false);

      if (delay) {
        hideTimeout = setTimeout(function () {
          if (instance.state.isVisible) {
            instance.hide();
          }
        }, delay);
      } else {
        // Fixes a `transitionend` problem when it fires 1 frame too
        // late sometimes, we don't want hide() to be called.
        scheduleHideAnimationFrame = requestAnimationFrame(function () {
          instance.hide();
        });
      }
    } // ===========================================================================
    // 🔑 Public methods
    // ===========================================================================


    function enable() {
      instance.state.isEnabled = true;
    }

    function disable() {
      // Disabling the instance should also hide it
      // https://github.com/atomiks/tippy.js-react/issues/106
      instance.hide();
      instance.state.isEnabled = false;
    }

    function clearDelayTimeouts() {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      cancelAnimationFrame(scheduleHideAnimationFrame);
    }

    function setProps(partialProps) {

      if (instance.state.isDestroyed) {
        return;
      }

      invokeHook('onBeforeUpdate', [instance, partialProps]);
      removeListeners();
      var prevProps = instance.props;
      var nextProps = evaluateProps(reference, Object.assign({}, instance.props, {}, partialProps, {
        ignoreAttributes: true
      }));
      instance.props = nextProps;
      addListeners();

      if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
        cleanupInteractiveMouseListeners();
        debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce);
      } // Ensure stale aria-expanded attributes are removed


      if (prevProps.triggerTarget && !nextProps.triggerTarget) {
        normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
          node.removeAttribute('aria-expanded');
        });
      } else if (nextProps.triggerTarget) {
        reference.removeAttribute('aria-expanded');
      }

      handleAriaExpandedAttribute();
      handleStyles();

      if (onUpdate) {
        onUpdate(prevProps, nextProps);
      }

      if (instance.popperInstance) {
        createPopperInstance(); // Fixes an issue with nested tippies if they are all getting re-rendered,
        // and the nested ones get re-rendered first.
        // https://github.com/atomiks/tippyjs-react/issues/177
        // TODO: find a cleaner / more efficient solution(!)

        getNestedPopperTree().forEach(function (nestedPopper) {
          // React (and other UI libs likely) requires a rAF wrapper as it flushes
          // its work in one
          requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
        });
      }

      invokeHook('onAfterUpdate', [instance, partialProps]);
    }

    function setContent(content) {
      instance.setProps({
        content: content
      });
    }

    function show() {


      var isAlreadyVisible = instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);

      if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
        return;
      } // Normalize `disabled` behavior across browsers.
      // Firefox allows events on disabled elements, but Chrome doesn't.
      // Using a wrapper element (i.e. <span>) is recommended.


      if (getCurrentTarget().hasAttribute('disabled')) {
        return;
      }

      invokeHook('onShow', [instance], false);

      if (instance.props.onShow(instance) === false) {
        return;
      }

      instance.state.isVisible = true;

      if (getIsDefaultRenderFn()) {
        popper.style.visibility = 'visible';
      }

      handleStyles();
      addDocumentPress();

      if (!instance.state.isMounted) {
        popper.style.transition = 'none';
      } // If flipping to the opposite side after hiding at least once, the
      // animation will use the wrong placement without resetting the duration


      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh2 = getDefaultTemplateChildren(),
            box = _getDefaultTemplateCh2.box,
            content = _getDefaultTemplateCh2.content;

        setTransitionDuration([box, content], 0);
      }

      onFirstUpdate = function onFirstUpdate() {
        var _instance$popperInsta2;

        if (!instance.state.isVisible || ignoreOnFirstUpdate) {
          return;
        }

        ignoreOnFirstUpdate = true; // reflow

        void popper.offsetHeight;
        popper.style.transition = instance.props.moveTransition;

        if (getIsDefaultRenderFn() && instance.props.animation) {
          var _getDefaultTemplateCh3 = getDefaultTemplateChildren(),
              _box = _getDefaultTemplateCh3.box,
              _content = _getDefaultTemplateCh3.content;

          setTransitionDuration([_box, _content], duration);
          setVisibilityState([_box, _content], 'visible');
        }

        handleAriaContentAttribute();
        handleAriaExpandedAttribute();
        pushIfUnique(mountedInstances, instance); // certain modifiers (e.g. `maxSize`) require a second update after the
        // popper has been positioned for the first time

        (_instance$popperInsta2 = instance.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
        instance.state.isMounted = true;
        invokeHook('onMount', [instance]);

        if (instance.props.animation && getIsDefaultRenderFn()) {
          onTransitionedIn(duration, function () {
            instance.state.isShown = true;
            invokeHook('onShown', [instance]);
          });
        }
      };

      mount();
    }

    function hide() {


      var isAlreadyHidden = !instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);

      if (isAlreadyHidden || isDestroyed || isDisabled) {
        return;
      }

      invokeHook('onHide', [instance], false);

      if (instance.props.onHide(instance) === false) {
        return;
      }

      instance.state.isVisible = false;
      instance.state.isShown = false;
      ignoreOnFirstUpdate = false;
      isVisibleFromClick = false;

      if (getIsDefaultRenderFn()) {
        popper.style.visibility = 'hidden';
      }

      cleanupInteractiveMouseListeners();
      removeDocumentPress();
      handleStyles();

      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh4 = getDefaultTemplateChildren(),
            box = _getDefaultTemplateCh4.box,
            content = _getDefaultTemplateCh4.content;

        if (instance.props.animation) {
          setTransitionDuration([box, content], duration);
          setVisibilityState([box, content], 'hidden');
        }
      }

      handleAriaContentAttribute();
      handleAriaExpandedAttribute();

      if (instance.props.animation) {
        if (getIsDefaultRenderFn()) {
          onTransitionedOut(duration, instance.unmount);
        }
      } else {
        instance.unmount();
      }
    }

    function hideWithInteractivity(event) {

      getDocument().addEventListener('mousemove', debouncedOnMouseMove);
      pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
      debouncedOnMouseMove(event);
    }

    function unmount() {

      if (instance.state.isVisible) {
        instance.hide();
      }

      if (!instance.state.isMounted) {
        return;
      }

      destroyPopperInstance(); // If a popper is not interactive, it will be appended outside the popper
      // tree by default. This seems mainly for interactive tippies, but we should
      // find a workaround if possible

      getNestedPopperTree().forEach(function (nestedPopper) {
        nestedPopper._tippy.unmount();
      });

      if (popper.parentNode) {
        popper.parentNode.removeChild(popper);
      }

      mountedInstances = mountedInstances.filter(function (i) {
        return i !== instance;
      });
      instance.state.isMounted = false;
      invokeHook('onHidden', [instance]);
    }

    function destroy() {

      if (instance.state.isDestroyed) {
        return;
      }

      instance.clearDelayTimeouts();
      instance.unmount();
      removeListeners();
      delete reference._tippy;
      instance.state.isDestroyed = true;
      invokeHook('onDestroy', [instance]);
    }
  }

  function tippy(targets, optionalProps) {
    if (optionalProps === void 0) {
      optionalProps = {};
    }

    var plugins = defaultProps.plugins.concat(optionalProps.plugins || []);

    bindGlobalEventListeners();
    var passedProps = Object.assign({}, optionalProps, {
      plugins: plugins
    });
    var elements = getArrayOfElements(targets);

    var instances = elements.reduce(function (acc, reference) {
      var instance = reference && createTippy(reference, passedProps);

      if (instance) {
        acc.push(instance);
      }

      return acc;
    }, []);
    return isElement(targets) ? instances[0] : instances;
  }

  tippy.defaultProps = defaultProps;
  tippy.setDefaultProps = setDefaultProps;
  tippy.currentInput = currentInput;

  // every time the popper is destroyed (i.e. a new target), removing the styles
  // and causing transitions to break for singletons when the console is open, but
  // most notably for non-transform styles being used, `gpuAcceleration: false`.

  Object.assign({}, applyStyles$1, {
    effect: function effect(_ref) {
      var state = _ref.state;
      var initialStyles = {
        popper: {
          position: state.options.strategy,
          left: '0',
          top: '0',
          margin: '0'
        },
        arrow: {
          position: 'absolute'
        },
        reference: {}
      };
      Object.assign(state.elements.popper.style, initialStyles.popper);
      state.styles = initialStyles;

      if (state.elements.arrow) {
        Object.assign(state.elements.arrow.style, initialStyles.arrow);
      } // intentionally return no cleanup function
      // return () => { ... }

    }
  });

  tippy.setDefaultProps({
    render: render
  });

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest$1();
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$1(arr);
  }

  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$1(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit$1(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
  }

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /* eslint-disable unicorn/prefer-switch */

  /*
  The MIT License (MIT)

  Copyright (c) 2016 NAVER Corp.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */

  /**
  * ImageMaps 1.1.0
  * jquery plugin which can be partially linked to the image
  *
  * https://github.com/naver/image-maps
  * demo - https://naver.github.io/image-maps/
  *
  * Released on: July 6, 2016.
  * @module imageMaps
  */
  var shapeFaceClass = '_shape_face';
  var shapeVertexClass = '_shape_vertex';
  var areaClass = 'area';
  /**
  * @typedef {"rect"|"circle"|"ellipse"|"text"|"image"|"poly"|
  * "polyline"|"polygon"} module:imageMaps.ShapeType
  */

  var SHAPE = {
    RECT: 'rect',
    CIRCLE: 'circle',
    ELLIPSE: 'ellipse',
    TEXT: 'text',
    IMAGE: 'image',
    POLY: 'poly',
    POLYLINE: 'polyline',
    POLYGON: 'polygon'
  };
  /**
   * @see https://api.jquery.com/css/
   * @typedef {PlainObject<string,string>} module:imageMaps.ShapeStyles
  */

  /**
  * @callback OnClick
  * @param {Event} e
  * @param {string} targetAreaHref
  * @returns {void}
  */

  /**
   * @callback MouseDown
   * @param {Event} e
   * @param {module:imageMaps.ShapeType} shapeType
   * @param {module:imageMaps.Coords} coords
   * @returns {void}
   */

  /**
  * @callback MouseMove
  * @param {Event} e
  * @param {module:imageMaps.ShapeType} shapeType
  * @param {module:imageMaps.MovedCoords} movedCoords
  * @returns {void}
  */

  /**
  * @callback MouseUp
  * @param {Event} e
  * @param {module:imageMaps.ShapeType} shapeType
  * @param {module:imageMaps.ShapeCoords} updatedCoords
  * @returns {void}
  */

  /**
  * @callback Select
  * @param {Event} e
  * @param {module:imageMaps.ShapeInfoOptions|
  *   module:imageMaps.ShapeSecondaryOptions} shapeInfo
  * @returns {void}
  */

  /**
  * @typedef {PlainObject} module:imageMaps.ImageMapOptions
  * @property {boolean} [isEditMode=false]
  * @property {module:imageMaps.ShapeType} [shape="rect"]
  * @property {string} [shapeText="press on link"]
  * @property {module:imageMaps.ShapeStyles} [shapeStyle] Defaults to
  *   `{fill: '#ffffff', 'fill-opacity': 0.2,
  *     stroke: '#ffffff', 'stroke-width': 3}`
  * @property {OnClick} [onClick=function () {}]
  * @property {MouseDown} [onMouseDown=function () {}]
  * @property {MouseMove} [onMouseMove=function () {}]
  * @property {MouseUp} [onMouseUp=function () {}]
  * @property {Select} [onSelect=function () {}]
  */

  /**
   * @type {module:imageMaps.ImageMapOptions}
   */

  var defaults = {
    isEditMode: false,
    // select map area shape type - rect, circle, text, image, poly
    shape: SHAPE.RECT,
    shapeText: 'press on link',
    // shape 옵션이 text일 때 적용된다.
    shapeStyle: {
      fill: '#ffffff',
      'fill-opacity': 0.2,
      stroke: '#ffffff',
      'stroke-width': 3
    },

    /* eslint-disable no-empty-function */
    onClick: function onClick(e, targetAreaHref) {},
    onMouseDown: function onMouseDown(e, shapeType, coords) {},
    onMouseMove: function onMouseMove(e, shapeType, movedCoords) {},
    onMouseUp: function onMouseUp(e, shapeType, updatedCoords) {},
    onSelect: function onSelect(e, shapeInfo) {}
    /* eslint-enable no-empty-function */

  };
  var defaultShapeOptions = {
    // top-left-x, top-left-y, bottom-right-x, botton-right-y
    rect: [0, 0, 20, 20],
    circle: [0, 0, 10],
    // center-x, center-y, radius
    ellipse: [0, 0, 5, 5],
    // center-x, center-y, radius-x, radius-y
    text: [0, 0, 12] // bottom-right-x, bottom-right-y, font-size

  };
  var FONT_SIZE_RATIO = 0.5;
  var NS_SVG = 'http://www.w3.org/2000/svg';
  var NS_XLINK = 'http://www.w3.org/1999/xlink';
  /**
   * Adds {@link external:"jQuery.fn"} methods.
   * @function module:imageMaps.jqueryImageMaps
   * @param {external:jQuery} $
   * @returns {external:jQuery}
   */

  function jqueryImageMaps$1($) {
    // The actual plugin constructor

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     */
    var ImageMaps = /*#__PURE__*/function () {
      /**
       *
       * @param {external:jQuery} container
       * @param {module:imageMaps.ImageMapOptions} [options]
       */
      function ImageMaps(container, options) {
        _classCallCheck$1(this, ImageMaps);

        this.container = $(container);
        this.mapEl = null;
        this.svgEl = null; // merge the default options with user-provided options

        this.options = $.extend(true, {}, defaults, options);
        this.shapeType = this.options.shape;
        this.isEditMode = this.options.isEditMode;
        this.shapeStyle = this.options.shapeStyle;
        this.shapeText = '';
        this.shapeImageUrl = '';
        this.shapeCoords = null;
        this.vertexCoords = null;
        this.grabType = null;
        this.containerWidth = 0;
        this.containerHeight = 0;
        this.touchStartCoords = {
          x: null,
          y: null
        };
        this.dragInfo = {
          face: {
            x: null,
            y: null
          },
          vertex: {
            x: null,
            y: null
          }
        };
        this.shapeLimitCoords = {
          x: 30,
          y: 30,
          radius: 15
        };
        this.allShapeInfo = {};
      }
      /**
       * ImageMaps: 이미지 엘리먼트 하단에 map, area 엘리먼트 생성 및 속성 부여.
       * @param {?(module:imageMaps.Coords)} coords
       * @param {Url} linkUrl
       * @returns {void}
       */


      _createClass$1(ImageMaps, [{
        key: "createMaps",
        value: function createMaps(coords, linkUrl) {
          var imageWidth = this.container.width();

          if (Number.isNaN(imageWidth) || !imageWidth) {
            this.container.one('load', $.proxy(_createMaps, this, coords, linkUrl));
          } else {
            _createMaps.call(this, coords, linkUrl);
          }
        }
        /**
         * @param {module:imageMaps.ShapeType} shapeType
         * @returns {void}
         */

      }, {
        key: "setShapeType",
        value: function setShapeType(shapeType) {
          this.shapeType = shapeType;
        }
        /**
         *
         * @param {module:imageMaps.ShapeStyles} [styleOptions]
         * @returns {void}
         */

      }, {
        key: "setShapeStyle",
        value: function setShapeStyle(styleOptions) {
          styleOptions = styleOptions || {};
          this.shapeStyle = $.extend({}, true, this.shapeStyle, styleOptions);
        }
        /**
         * @todo Implement
         * @param {Url} linkUrl
         * @param {Integer} index
         * @returns {void}
         */

      }, {
        key: "setUrl",
        value: function setUrl(linkUrl, index) {// eslint-disable-line class-methods-use-this
          // Todo
        }
        /**
         *
         * @param {string} text
         * @param {module:imageMaps.ShapeStyles} [styleOptions]
         * @returns {void}
         */

      }, {
        key: "setTextShape",
        value: function setTextShape(text, styleOptions) {
          this.setShapeStyle(styleOptions);
          this.shapeText = text;
        }
        /**
         *
         * @param {string} imageUrl
         * @param {module:imageMaps.ShapeStyles} [styleOptions]
         * @returns {void}
         */

      }, {
        key: "setImageShape",
        value: function setImageShape(imageUrl, styleOptions) {
          this.setShapeStyle(styleOptions);
          this.shapeImageUrl = imageUrl;
        }
        /**
         *
         * @param {?(module:imageMaps.Coords)} coords
         * @param {Url} linkUrl
         * @param {module:imageMaps.ShapeType} [shapeType]
         * @returns {void}
         */

      }, {
        key: "addShape",
        value: function addShape(coords, linkUrl, shapeType) {
          if (shapeType) {
            this.setShapeType(shapeType);
          }

          this.createMaps(coords, linkUrl);
        }
        /**
         * @param {Integer} [index]
         * @returns {void}
         */

      }, {
        key: "removeShape",
        value: function removeShape(index) {
          if (!this.shapeEl) {
            return;
          }

          if (typeof index === 'undefined') {
            index = this.shapeEl.data('index');
          }

          var areaEl = this.mapEl.find('area[data-index="' + index + '"]');
          var shapeEl = this.svgEl.find('.' + shapeFaceClass + '[data-index="' + index + '"]');
          this.detachEvents(shapeEl, [{
            type: 'click touchend'
          }]);
          shapeEl.parent().remove();
          areaEl.remove();
          this.removeShapeInfo(index);
        }
        /**
         *
         * @returns {void}
         */

      }, {
        key: "removeAllShapes",
        value: function removeAllShapes() {
          var _this = this;

          if (!this.shapeEl) {
            return;
          }

          var allShapeEls = this.svgEl.find('.' + shapeFaceClass);
          allShapeEls.each(function (i, shapeEl) {
            _this.removeShape($(shapeEl).data('index'));
          });
          this.allShapeInfo = {};
        }
        /**
         *
         * @returns {void}
         */

      }, {
        key: "removeImageMaps",
        value: function removeImageMaps() {
          this.removeAllShapes();
          this.svgEl && this.svgEl.remove();
        }
        /**
        * @typedef {PlainObject} module:imageMaps.ShapeInfoOptions
        * @property {Integer} index
        * @property {module:imageMaps.ShapeCoords} coords
        * @property {module:imageMaps.ShapeType} type
        * @property {Url} url
        * @property {module:imageMaps.ShapeStyles} style
        */

        /**
        * @typedef {PlainObject} module:imageMaps.ShapeSecondaryOptions
        * @property {string} text
        * @property {HTMLImageElement|string} href
        */

        /**
         *
         * @param {Integer} index
         * @param {module:imageMaps.ShapeInfoOptions} shapeOptions
         * @param {
         *   module:imageMaps.ShapeSecondaryOptions
         * } [shapeSecondaryOptions]
         * @returns {void}
         */

      }, {
        key: "updateShapeInfo",
        value: function updateShapeInfo(index, shapeOptions, shapeSecondaryOptions) {
          var shapeInfo = this.allShapeInfo;
          shapeOptions.index = index;

          if (!shapeInfo['shape' + index]) {
            shapeInfo['shape' + index] = $.extend(true, shapeOptions, shapeSecondaryOptions);
          } else {
            shapeInfo['shape' + index] = $.extend(true, {}, shapeInfo['shape' + index], shapeOptions, shapeSecondaryOptions);
          }
        }
        /**
         * @param {Integer} index
         * @returns {void}
         */

      }, {
        key: "removeShapeInfo",
        value: function removeShapeInfo(index) {
          delete this.allShapeInfo['shape' + index];
        }
        /**
         *
         * @param {Integer} index
         * @returns {module:imageMaps.ShapeInfoOptions|
         *   module:imageMaps.ShapeSecondaryOptions}
         */

      }, {
        key: "getShapeInfo",
        value: function getShapeInfo(index) {
          return this.allShapeInfo['shape' + index];
        }
        /**
        * @typedef {PlainObject} module:imageMaps.AllShapeInfo
        * @property {module:imageMaps.ShapeType} type
        * @property {module:imageMaps.Coords} coords
        * @property {Integer} index
        * @property {module:imageMaps.ShapeInfoOptions|
        *   module:imageMaps.ShapeSecondaryOptions} shape<num>
        */

        /**
         *
         * @returns {module:imageMaps.AllShapeInfo}
         */

      }, {
        key: "getAllShapesInfo",
        value: function getAllShapesInfo() {
          return $.extend(true, {}, this.allShapeInfo);
        }
        /**
         *
         * @param {Float[]} percentages
         * @returns {void}
         */

      }, {
        key: "zoom",
        value: function zoom(percentages) {
          _zoom.call(this, percentages);
        }
        /**
         *
         * @returns {void}
         */

      }, {
        key: "enableClick",
        value: function enableClick() {
          this.attachEvents(this.svgEl.find('.' + shapeFaceClass), [{
            type: 'touchstart',
            handler: onTouchStart
          }, {
            type: 'click touchend',
            handler: onClickShapeFace
          }]);
        }
        /**
         *
         * @returns {void}
         */

      }, {
        key: "disableClick",
        value: function disableClick() {
          this.detachEvents(this.svgEl.find('.' + shapeFaceClass), [{
            type: 'touchstart',
            handler: onTouchStart
          }, {
            type: 'click touchend',
            handler: onClickShapeFace
          }]);
        }
        /**
         *
         * @param {module:imageMaps.ShapeCoords} coords
         * @returns {void}
         */

      }, {
        key: "setShapeCoords",
        value: function setShapeCoords(coords) {
          this.shapeCoords = coords;
        }
        /**
         *
         * @param {module:imageMaps.VertexCoords} coords
         * @returns {void}
         */

      }, {
        key: "setVertexCoords",
        value: function setVertexCoords(coords) {
          this.vertexCoords = coords;
        }
        /**
         *
         * @param {module:imageMaps.ShapeElement} element
         * @returns {void}
         */

      }, {
        key: "setShapeElement",
        value: function setShapeElement(element) {
          this.shapeEl = element;
        }
        /**
        * @typedef {Element} module:imageMaps.VertexElement
        */

        /**
         *
         * @param {module:imageMaps.VertexElement} element
         * @returns {void}
         */

      }, {
        key: "setVertexElement",
        value: function setVertexElement(element) {
          this.vertexEl = element;
        }
        /**
         *
         * @param {module:imageMaps.VertexElements} elements
         * @returns {void}
         */

      }, {
        key: "setVertexElements",
        value: function setVertexElements(elements) {
          this.vertexEls = elements;
        }
        /**
        * @callback Handler
        * @param {Event} e
        * @param {...any} extraParameters
        * @returns {boolean}
        */

        /**
        * @typedef {PlainObject} module:imageMaps.TypeHandler
        * @property {string} type
        * @property {Handler} handler
        */

        /**
         * ImageMaps: 이미지맵 이벤트 할당.
         * @param {Node|external:jQuery} element
         * @param {module:imageMaps.TypeHandler[]} eventOptions
         * @returns {void}
         */

      }, {
        key: "attachEvents",
        value: function attachEvents(element, eventOptions) {
          var _this2 = this;

          element = $(element);
          eventOptions.forEach(function (_ref) {
            var type = _ref.type,
                handler = _ref.handler;
            element.on(type + '.' + areaClass, $.proxy(handler, _this2));
          });
        }
        /**
         * ImageMaps: 이미지맵 이벤트 해제.
         * @param {external:jQuery} element
         * @param {module:imageMaps.TypeHandler[]} eventOptions
         * @returns {void}
         */

      }, {
        key: "detachEvents",
        value: function detachEvents(element, eventOptions) {
          var _this3 = this;

          element = $(element);
          eventOptions.forEach(function (_ref2) {
            var type = _ref2.type,
                handler = _ref2.handler;
            var eventType = type || '';
            var eventHandler = handler ? $.proxy(handler, _this3) : '';

            if (eventHandler) {
              element.off(eventType + '.' + areaClass, eventHandler);
            } else {
              element.off(eventType + '.' + areaClass);
            }
          });
        }
      }]);

      return ImageMaps;
    }();

    ImageMaps.getCoordsByRatio = getCoordsByRatio;
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {?(module:imageMaps.Coords)} coords
     * @param {Url} linkUrl
     * @returns {void}
     */

    function _createMaps(coords, linkUrl) {
      // 최초 맵영역을 만드는 순간에 map 엘리먼트를 만들고 하위에 area 엘리먼트 생성.
      var uid = guid();

      if (!this.container.attr('usemap')) {
        this.mapEl = $('<map name=' + uid + '></map>').insertAfter(this.container);
        this.container.attr('usemap', '#' + uid);
      } else {
        var usemapName = this.container.attr('usemap').replace('#', '');
        this.mapEl = $('body').find('map[name=' + usemapName + ']');
      }

      this.containerWidth = this.container.width();
      this.containerHeight = this.container.height();
      var imageWidth = this.containerWidth;
      var imageHeight = this.containerHeight;
      var centerX = imageWidth / 2;
      var centerY = imageHeight / 2; // 파라미터로 좌표값을 받으면 좌표에 해당하는 영역을 함께 그려준다.

      var shapeType = this.shapeType;
      var shapeCoords = [];
      var isDefaultTextCoords = false;
      coords = convertStringToNumber(coords);

      if (!Array.isArray(coords)) {
        // default 편집영역의 사이즈는 이미지의 0.1배로 계산. (내 맘대로..)
        var defaultShapeX = imageWidth * 0.1,
            defaultShapeY = imageHeight * 0.1;
        var defaultRadius = defaultShapeX >= defaultShapeY ? defaultShapeY : defaultShapeX; // invalid 좌표값이거나 배열이 아닌 타입일 경우는 디폴트 좌표로 그린다.

        if (shapeType === SHAPE.RECT) {
          shapeCoords = $.extend([], defaultShapeOptions.rect, [centerX - defaultShapeX, centerY - defaultShapeY, centerX + defaultShapeX, centerY + defaultShapeY]);
        } else if (shapeType === SHAPE.CIRCLE) {
          shapeCoords = $.extend([], defaultShapeOptions.circle, [centerX, centerY, defaultRadius]);
        } else if (shapeType === SHAPE.ELLIPSE) {
          shapeCoords = $.extend([], defaultShapeOptions.ellipse, [centerX, centerY, defaultRadius, defaultRadius]);
        } else if (shapeType === SHAPE.IMAGE) {
          var imageSize = getNaturalImageSize(this.shapeImageUrl);
          defaultShapeX = imageSize.width / 2;
          defaultShapeY = imageSize.height / 2;
          shapeCoords = [centerX - defaultShapeX, centerY - defaultShapeY, centerX + defaultShapeX, centerY + defaultShapeY];
        } else ;
      } else {
        // 타입별로 정상적으로 좌표값을 받았다면 해당 좌표로 그린다.
        // eslint-disable-next-line no-lonely-if
        if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
          shapeCoords = $.extend([], defaultShapeOptions.rect, coords);
        } else if (shapeType === SHAPE.CIRCLE) {
          shapeCoords = $.extend([], defaultShapeOptions.circle, coords);
        } else if (shapeType === SHAPE.ELLIPSE) {
          shapeCoords = $.extend([], defaultShapeOptions.ellipse, coords);
        } else if (shapeType === SHAPE.TEXT) {
          if (!coords[0]) {
            coords[0] = centerX;
            isDefaultTextCoords = true;
          }

          if (!coords[1]) {
            coords[1] = centerY;
            isDefaultTextCoords = true;
          }

          if (!coords[2]) {
            coords[2] = 20;
          }

          shapeCoords = $.extend([], defaultShapeOptions.text, coords);
        } else ;
      }

      var index = this.mapEl.find('.' + shapeFaceClass).length;
      var areaType = shapeType;
      var shapeSecondaryOptions = {};

      if (shapeType === SHAPE.TEXT || shapeType === SHAPE.IMAGE) {
        areaType = SHAPE.RECT;
        shapeSecondaryOptions = shapeType === SHAPE.TEXT ? {
          text: this.shapeText
        } : {
          href: this.shapeImageUrl
        };
      }

      createOverlay.call(this, shapeCoords, uid, linkUrl, index);
      this.setShapeCoords(shapeCoords);
      this.updateShapeInfo(index, {
        coords: shapeCoords,
        type: shapeType,
        url: linkUrl,
        style: this.shapeStyle
      }, shapeSecondaryOptions);

      if (isDefaultTextCoords && this.isEditMode && shapeType === SHAPE.TEXT) {
        adjustTextShape.call(this);
      }

      if (shapeType === SHAPE.ELLIPSE) {
        areaType = SHAPE.CIRCLE;
        shapeCoords = [shapeCoords[0], shapeCoords[1], defaultShapeOptions.ellipse[2], defaultShapeOptions.ellipse[2]];
      }

      createArea.call(this, areaType, shapeCoords, linkUrl, index);
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {string} uid
     * @param {Url} linkUrl
     * @param {Integer} index
     * @returns {void}
     */


    function createOverlay(shapeCoords, uid, linkUrl, index) {
      var containerWidth = this.container.width(),
          containerHeight = this.container.height();

      if (typeof document.createElementNS !== 'undefined') {
        var svgNativeEl = this.mapEl.find('svg').get(0);
        var svgEl = $(svgNativeEl);
        var shapeType = this.shapeType;

        if (!svgNativeEl) {
          svgNativeEl = document.createElementNS(NS_SVG, 'svg');
          svgEl = $(svgNativeEl);
          this.svgEl = svgEl;

          if (this.isEditMode) {
            this.attachEvents(svgEl, [{
              type: 'mousedown',
              handler: onMouseDown
            }]);
          } else {
            this.attachEvents(this.mapEl, [{
              type: 'touchstart',
              handler: onTouchStart
            }, {
              type: 'click touchend',
              handler: onClickShapeFace
            }]);
          }

          this.attachEvents(window, [{
            type: 'resize',
            handler: onResize
          }]);
        } // svgEl.get(0).setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        // svg의 width, height는 DOM API로 처리해야 사이즈가 제대로 나옴.


        svgNativeEl.setAttribute('width', containerWidth);
        svgNativeEl.setAttribute('height', containerHeight); // container의 부모에 대한 상대좌표에 따라 svg의 좌표값이 결정된다.

        var containerPos = this.container.position();
        svgEl.attr({
          xmlns: NS_SVG,
          'xmlns:xlink': NS_XLINK,
          version: '1.1',
          'data-Id': uid
        }).css({
          position: 'absolute',
          zIndex: 1000,
          overflow: 'hidden',
          top: containerPos.top,
          left: containerPos.left
        });
        var shapeGroupEl = createShape.call(this, shapeType, shapeCoords, linkUrl, index);
        svgEl.append(shapeGroupEl);
        this.mapEl.append(svgEl);
      }
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {string} areaType
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {Url} linkUrl
     * @param {string|Integer} index
     * @returns {void}
     */


    function createArea(areaType, shapeCoords, linkUrl, index) {
      $('<area shape=' + areaType + ' coords=' + shapeCoords.join(',') + ' href=' + (linkUrl || '#') + ' data-index=' + index + ' ' + (linkUrl ? 'target="_blank"' : '') + '>').appendTo(this.mapEl);
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.ShapeType} shapeType
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {Url} linkUrl
     * @param {string|Integer} index
     * @returns {void}
     */


    function createShape(shapeType, shapeCoords, linkUrl, index) {
      if (shapeType === SHAPE.POLY) {
        shapeType = SHAPE.POLYLINE;
      }

      var shapeEl = $(document.createElementNS(NS_SVG, shapeType));
      var gEl = $(document.createElementNS(NS_SVG, 'g'));
      drawShape.call(this, shapeCoords, shapeEl);
      var cursor = 'default';

      if (this.isEditMode) {
        cursor = 'move';
      } else if (linkUrl !== '') {
        cursor = 'pointer';
      }

      this.setShapeStyle({
        cursor: cursor
      });
      shapeEl.css(this.shapeStyle);

      if (shapeType === SHAPE.TEXT) {
        shapeEl.css({
          'fill-opacity': '',
          'stroke-opacity': ''
        });
      }

      shapeEl.attr('data-index', index);
      gEl.append(shapeEl);
      this.setShapeElement(shapeEl);

      if (this.isEditMode && shapeType !== 'text') {
        var vertexEls = createVertex(shapeType, shapeCoords, index);
        gEl.append.apply(gEl, _toConsumableArray$1(vertexEls));
        this.setVertexElements(vertexEls);
      }

      return gEl;
    }
    /**
    * @typedef {PlainObject} module:imageMaps.ShapeOptions
    * @property {string} text
    * @property {string} href
    * @property {module:imageMaps.ShapeType} type
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {module:imageMaps.ShapeElement} [shapeEl]
     * @param {module:imageMaps.ShapeOptions} [shapeOptions]
     * @returns {void}
     */


    function drawShape(shapeCoords, shapeEl, shapeOptions) {
      shapeEl = shapeEl || this.shapeEl;
      var shapeType = shapeOptions ? shapeOptions.type : this.shapeType;

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        shapeEl.attr({
          x: shapeCoords[0],
          y: shapeCoords[1],
          "class": shapeFaceClass
        });

        if (shapeCoords[2]) {
          shapeEl.attr('width', shapeCoords[2] - shapeCoords[0]);
        }

        if (shapeCoords[3]) {
          shapeEl.attr('height', shapeCoords[3] - shapeCoords[1]);
        }

        if (shapeType === SHAPE.IMAGE) {
          // xlink 속성 설정 시에는 DOM api의 setAttributeNS를 사용해야 함.
          // svg 전용 속성은 무조건 DOM api를 사용해야 함.
          shapeEl.get(0).setAttributeNS(NS_XLINK, 'href', shapeOptions ? shapeOptions.href : this.shapeImageUrl); // image 엘리먼트의 width, height를 고정 비율로 변경되는 걸 해제해주기 위한 속성 셋팅.

          shapeEl.get(0).setAttribute('preserveAspectRatio', 'none');
        }
      } else if (shapeType === SHAPE.CIRCLE) {
        shapeEl.attr({
          cx: shapeCoords[0],
          cy: shapeCoords[1],
          "class": shapeFaceClass
        });

        if (shapeCoords[2]) {
          shapeEl.attr('r', shapeCoords[2]);
        }
      } else if (shapeType === SHAPE.ELLIPSE) {
        shapeEl.attr({
          cx: shapeCoords[0],
          cy: shapeCoords[1],
          "class": shapeFaceClass
        });

        if (shapeCoords[2]) {
          shapeEl.attr('rx', shapeCoords[2]);
        }

        if (shapeCoords[3]) {
          shapeEl.attr('ry', shapeCoords[3]);
        }
      } else if (shapeType === SHAPE.TEXT) {
        shapeEl.attr({
          x: shapeCoords[0],
          y: shapeCoords[1],
          'font-size': shapeCoords[2],
          "class": shapeFaceClass
        });
        shapeEl.text(shapeOptions && shapeOptions.text || this.shapeText);
      } else ;
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @returns {void}
     */


    function adjustTextShape() {
      var shapeEl = this.shapeEl;
      var shapeSize = shapeEl.get(0).getBBox();
      var centerX = shapeSize.width / 2;
      var centerY = Number.parseFloat(shapeEl.attr('font-size')) * FONT_SIZE_RATIO / 2;
      var bottomRightX = Number.parseInt(shapeEl.attr('x'));
      var bottomRightY = Number.parseInt(shapeEl.attr('y'));
      var resultX = bottomRightX - centerX;
      var resultY = bottomRightY + centerY;
      this.updateShapeInfo(shapeEl.data('index'), {
        coords: [resultX, resultY, shapeEl.attr('font-size')]
      });
      shapeEl.attr({
        x: resultX,
        y: resultY
      });
    }
    /**
     * `SVGRect` element for each vertex coordinate.
     * @typedef {SVGRect[]} module:imageMaps.VertexElements One
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.ShapeType} shapeType
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {Integer} index
     * @returns {module:imageMaps.VertexElements}
     */


    function createVertex(shapeType, shapeCoords, index) {
      var vertexCoords = calculateVertexCoords(shapeType, shapeCoords);
      var vertexTemp = vertexCoords.map(function () {
        var vertexEl = $(document.createElementNS(NS_SVG, 'rect'));
        vertexEl.attr('data-index', index).css({
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-width': 2
        });
        return vertexEl;
      });
      drawVertex(vertexCoords, vertexTemp);
      return vertexTemp;
    }
    /**
    * @typedef {PlainObject} module:imageMaps.VertexCoords
    * @property {Float} x
    * @property {Float} y
    * @property {module:imageMaps.CursorType} type
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.VertexCoords} vertexCoords
     * @param {module:imageMaps.VertexElements} vertexEls
     * @param {module:imageMaps.ShapeType} shapeType Not currently in use
     * @returns {void}
     */


    function drawVertex(vertexCoords, vertexEls, shapeType) {
      vertexCoords.forEach(function (eachCoords, i) {
        $(vertexEls[i]).attr({
          x: eachCoords.x - 3,
          y: eachCoords.y - 3,
          width: 7,
          height: 7,
          'data-direction': eachCoords.type,
          "class": shapeVertexClass
        }).css('cursor', getCursor(eachCoords.type));
      });
    }
    /**
    * @typedef {module:imageMaps.Coords} module:imageMaps.ShapeCoords
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.ShapeType} shapeType
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @returns {module:imageMaps.VertexCoords}
     */


    function calculateVertexCoords(shapeType, shapeCoords) {
      var vertexArr = [];

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        // 좌상, 좌하, 우상, 우하, 상, 하, 좌, 우 순
        // 개별 vertex의 좌표값이므로 좌표의 순서는 크게 상관 없지만 참고로...
        vertexArr = [{
          x: shapeCoords[0],
          y: shapeCoords[1],
          type: 'nw'
        }, {
          x: shapeCoords[0],
          y: shapeCoords[3],
          type: 'sw'
        }, {
          x: shapeCoords[2],
          y: shapeCoords[1],
          type: 'ne'
        }, {
          x: shapeCoords[2],
          y: shapeCoords[3],
          type: 'se'
        }, {
          x: (shapeCoords[2] - shapeCoords[0]) / 2 + shapeCoords[0],
          y: shapeCoords[1],
          type: 'n'
        }, {
          x: (shapeCoords[2] - shapeCoords[0]) / 2 + shapeCoords[0],
          y: shapeCoords[3],
          type: 's'
        }, {
          x: shapeCoords[0],
          y: (shapeCoords[3] - shapeCoords[1]) / 2 + shapeCoords[1],
          type: 'w'
        }, {
          x: shapeCoords[2],
          y: (shapeCoords[3] - shapeCoords[1]) / 2 + shapeCoords[1],
          type: 'e'
        }];
      } else if (shapeType === SHAPE.CIRCLE) {
        // 상, 하, 좌, 우
        vertexArr = [{
          x: shapeCoords[0],
          y: shapeCoords[1] - shapeCoords[2],
          type: 'n'
        }, {
          x: shapeCoords[0],
          y: shapeCoords[1] + shapeCoords[2],
          type: 's'
        }, {
          x: shapeCoords[0] - shapeCoords[2],
          y: shapeCoords[1],
          type: 'w'
        }, {
          x: shapeCoords[0] + shapeCoords[2],
          y: shapeCoords[1],
          type: 'e'
        }];
      } else if (shapeType === SHAPE.ELLIPSE) {
        // 상, 하, 좌, 우
        vertexArr = [{
          x: shapeCoords[0],
          y: shapeCoords[1] - shapeCoords[3],
          type: 'n'
        }, {
          x: shapeCoords[0],
          y: shapeCoords[1] + shapeCoords[3],
          type: 's'
        }, {
          x: shapeCoords[0] - shapeCoords[2],
          y: shapeCoords[1],
          type: 'w'
        }, {
          x: shapeCoords[0] + shapeCoords[2],
          y: shapeCoords[1],
          type: 'e'
        }];
      } else ;

      return vertexArr;
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.ShapeCoords} shapeCoords
     * @param {Element} areaEl
     * @param {module:imageMaps.ShapeType} [shapeType]
     * @returns {void}
     */


    function drawArea(shapeCoords, areaEl, shapeType) {
      var shapeEl = this.svgEl.find('.' + shapeFaceClass + '[data-index="' + areaEl.data('index') + '"]');
      shapeType = shapeType || this.shapeType;

      if (shapeType === SHAPE.TEXT) {
        shapeCoords = convertTextToRectCoords(shapeEl);
      } else if (shapeType === SHAPE.ELLIPSE) {
        shapeCoords = [shapeCoords[0], shapeCoords[1], defaultShapeOptions.ellipse[2]];
      }

      areaEl.attr('coords', shapeCoords.join(','));
    }
    /**
    * @typedef {"col"|"row"|Direction|"ew"|
    * "ns"|"nesw"|"nwse"} module:imageMaps.CursorType
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.CursorType} type
     *     CSS cursor resize type
     * @returns {string}
     */


    function getCursor(type) {
      return type + '-resize';
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `touchstart` event
     * @returns {void}
     */


    function onTouchStart(e) {
      var touchCoords = e.originalEvent.touches[0];
      this.touchStartCoords.x = touchCoords.pageX;
      this.touchStartCoords.y = touchCoords.pageY;
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `click touchend` event
     * @returns {void}
     */


    function onClickShapeFace(e) {
      // IE8이 이외의 브라우저는 아래 계산 로직을 타지 않아도 된다.
      // IE8은 area 엘리먼트 클릭 시 href 속성의 url로 이동.
      var targetAreaEl = $(e.currentTarget);

      if (e.currentTarget.tagName.toLowerCase() !== 'area') {
        e.preventDefault();

        if (this.dragInfo.face.x && this.dragInfo.face.x !== e.pageX || this.dragInfo.face.y && this.dragInfo.face.y !== e.pageY || e.target.tagName.toLowerCase() === 'svg' || e.type === 'touchend' && e.originalEvent.changedTouches[0].pageX !== this.touchStartCoords.x && e.originalEvent.changedTouches[0].pageY !== this.touchStartCoords.y) {
          return;
        } // 클릭하거나 마우스엔터, 마우스다운 된 shape를 현재 타겟으로 저장.
        // 타겟이 되는 shape의 좌표 정보를 가지고 모든 로직이 수행되도록 한다.


        var targetEl = $(e.target);
        var index = targetEl.attr('data-index');
        targetAreaEl = this.mapEl.find('area[data-index="' + index + '"]');
        var url = targetAreaEl.attr('href');
        url !== '#' && window.open(targetAreaEl.attr('href'));
      }

      this.options.onClick.call(this, e, targetAreaEl.attr('href'));
    } // drag & drop

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `mousedown` event
     * @returns {void}
     */


    function onMouseDown(e) {
      e.preventDefault();

      if (e.target.tagName.toLowerCase() === 'svg') {
        return;
      }

      var targetEl = $(e.target);
      var index = targetEl.attr('data-index');
      var shapeInfo = this.getShapeInfo(index);
      var groupEl = targetEl.parent();
      var shapeEl = groupEl.find(':first-child');
      var coords = [];
      var shapeType = shapeEl.get(0).tagName.toLowerCase();

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        var targetX = Number.parseInt(shapeEl.attr('x'));
        var targetY = Number.parseInt(shapeEl.attr('y'));
        coords = [targetX, targetY, targetX + Number.parseInt(shapeEl.attr('width')), targetY + Number.parseInt(shapeEl.attr('height'))];

        if (shapeType === SHAPE.IMAGE) {
          this.setImageShape(shapeEl.attr('href'));
        }
      } else if (shapeType === SHAPE.CIRCLE) {
        var _targetX = Number.parseInt(shapeEl.attr('cx'));

        var _targetY = Number.parseInt(shapeEl.attr('cy'));

        coords = [_targetX, _targetY, Number.parseInt(shapeEl.attr('r'))];
      } else if (shapeType === SHAPE.ELLIPSE) {
        var _targetX2 = Number.parseInt(shapeEl.attr('cx'));

        var _targetY2 = Number.parseInt(shapeEl.attr('cy'));

        coords = [_targetX2, _targetY2, Number.parseInt(shapeEl.attr('rx')), Number.parseInt(shapeEl.attr('ry'))];
      } else if (shapeType === SHAPE.TEXT) {
        var _targetX3 = Number.parseFloat(shapeEl.attr('x'));

        var _targetY3 = Number.parseFloat(shapeEl.attr('y'));

        var fontSize = Number.parseFloat(shapeEl.attr('font-size'));
        coords = [_targetX3, _targetY3, fontSize];
        this.shapeText = shapeEl.text();
      } else if (shapeType === SHAPE.POLYGON) {
        shapeType = SHAPE.POLY;
      }

      this.setShapeType(shapeType);
      this.setShapeElement(shapeEl);
      this.setShapeCoords(coords);

      if (shapeType !== SHAPE.TEXT) {
        shapeEl.attr('data-fill', shapeEl.css('fill'));
        shapeEl.css('fill', '#ffffff');
        this.setVertexCoords(calculateVertexCoords(shapeType, coords));
        var vertexTemp = [];
        var vertexEls = this.mapEl.find('.' + shapeVertexClass + '[data-index="' + index + '"]');
        vertexEls.each(function () {
          vertexTemp.push($(this));
        });
        this.setVertexElements(vertexTemp);
      }

      if (targetEl.is('.' + shapeFaceClass)) {
        this.grabType = 'face';
        declareShape.call(this, targetEl, e.pageX, e.pageY);
      } else if (targetEl.is('.' + shapeVertexClass)) {
        this.grabType = 'vertex';
        declareVertex.call(this, targetEl, index);
      }

      this.attachEvents(this.mapEl.parent(), [{
        type: 'mouseup',
        handler: onMouseUp
      }, {
        type: 'mousemove',
        handler: onMouseMove
      }]);
      this.options.onSelect.call(this, e, shapeInfo);
      this.options.onMouseDown.call(this, e, shapeType, coords);
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `mouseup` event
     * @returns {void}
     */


    function onMouseUp(e) {
      var targetEl = $(e.target);
      var shapeEl = this.shapeEl;
      shapeEl.css('fill', shapeEl.attr('data-fill'));
      targetEl.attr('data-movable', false);
      var updatedCoords = determineShape.call(this);
      this.setShapeCoords(updatedCoords);
      this.updateShapeInfo(shapeEl.data('index'), {
        coords: updatedCoords
      });
      this.detachEvents(this.mapEl.parent(), [{
        type: 'mouseup',
        handler: onMouseUp
      }, {
        type: 'mousemove',
        handler: onMouseMove
      }]);
      this.options.onMouseUp.call(this, e, this.shapeType, updatedCoords);
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `mousemove` event
     * @returns {void}
     */


    function onMouseMove(e) {
      var targetEl = $(e.target);

      var _this$shapeCoords = _slicedToArray$1(this.shapeCoords, 2),
          x = _this$shapeCoords[0],
          y = _this$shapeCoords[1];

      var grabType = this.grabType,
          shapeType = this.shapeType;
      var coords = {}; // 좌표 계산 시 e.offsetX, offsetY값은 이벤트 발생 대상(e.currentTarget)
      //   기준 좌표 값이므로
      // 이벤트 발생 도중(특히 mousemove) 겹치는 이벤트 타겟이 생기면 해당 타겟 기준
      //    좌표로 변경되어 좌표가 튀는 현상 발생.
      // 그러므로 브라우저에서 drag & drop 구현 시 웬만하면 브라우저의 절대 좌표값인
      //    e.pageX, pageY를 사용하도록 한다.

      if (grabType === 'face' || grabType === 'vertex') {
        if (grabType === 'face') {
          var movedX = x + e.pageX;
          var movedY = y + e.pageY;
          coords = getMovedShapeCoords.call(this, movedX - this.dragInfo.face.x, movedY - this.dragInfo.face.y);
        } else if (grabType === 'vertex') {
          coords = getMovedVertexCoords.call(this, e.pageX - this.svgEl.offset().left, e.pageY - this.svgEl.offset().top);
        }

        if (!coords) {
          return;
        }

        if (shapeType !== SHAPE.TEXT) {
          this.setVertexCoords(coords.vertexCoords);
          drawVertex(coords.vertexCoords, this.vertexEls, this.shapeType);
        }

        var index = Number.parseInt(coords.grabEl.attr('data-index'));
        drawShape.call(this, coords.movedCoords, this.svgEl.find('.' + shapeFaceClass + '[data-index="' + index + '"]'));
        drawArea.call(this, coords.movedCoords, this.mapEl.find('area[data-index="' + index + '"]')); // svg 내 엘리먼트들은 z-index 영향을 받지 않고 document 순서에 영향을 받는다.
        // 그래서 drag 시 다른 요소들보다 최상위에 두려면 엘리먼트 순서를 부모의 가장 하위에 두어야 한다.
        // mousedown에서 이 로직을 넣을 경우,
        // 외부에서 click 이벤트를 할당했을 때 mousedown 핸들러에서 dom 우선순위 조정하는 과정에서
        //    click 이벤트가 해제되는 이슈로 mousemove 안에 둠.

        if ((targetEl.is('.' + shapeFaceClass) || targetEl.is('.' + shapeVertexClass)) && (Math.abs(this.dragInfo.face.x - e.pageX) <= 1 || Math.abs(this.dragInfo.face.y - e.pageY) <= 1)) {
          this.svgEl.append(targetEl.parent());
        }

        this.options.onMouseMove.call(this, e, shapeType, coords.movedCoords);
      }
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Event} e The `resize` event
     * @returns {void}
     */


    function onResize(e) {
      var containerWidth = this.container.width();
      var containerHeight = this.container.height();

      if (this.containerWidth !== containerWidth || this.containerHeight !== containerHeight) {
        redraw.call(this, containerWidth, containerHeight);
      }
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Float[]} percentages
     * @returns {void}
     */


    function _zoom(percentages) {
      var _this4 = this;

      var widthPercentage = percentages[0];
      var heightPercentage = percentages.length < 2 ? widthPercentage : percentages[1];
      var containerWidth = widthPercentage * 0.01 * this.container.width();
      var containerHeight = heightPercentage * 0.01 * this.container.height();
      this.container.css({
        width: containerWidth + 'px',
        height: containerHeight + 'px'
      });
      setTimeout(function () {
        if (_this4.svgEl && _this4.svgEl.length > 0) {
          redraw.call(_this4, containerWidth, containerHeight);
        }
      });
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Float} containerWidth
     * @param {Float} containerHeight
     * @returns {void}
     */


    function redraw(containerWidth, containerHeight) {
      var _this5 = this;

      var allShapeInfo = this.allShapeInfo;
      var widthRatio = containerWidth / this.containerWidth;
      var heightRatio = containerHeight / this.containerHeight;
      var containerPos = this.container.position();
      this.svgEl.get(0).setAttribute('width', containerWidth);
      this.svgEl.get(0).setAttribute('height', containerHeight);
      this.svgEl.css({
        top: containerPos.top,
        left: containerPos.left
      });
      $.each(allShapeInfo, function (index, item) {
        item.coords = getCoordsByRatio(item.coords, item.type, widthRatio, heightRatio);
        drawVertex(calculateVertexCoords(item.type, item.coords), _this5.svgEl.find('.' + shapeVertexClass + '[data-index="' + item.index + '"]'), item.type);
        drawShape.call(_this5, item.coords, _this5.svgEl.find('.' + shapeFaceClass + '[data-index="' + item.index + '"]'), item);
        drawArea.call(_this5, item.coords, _this5.mapEl.find('area[data-index="' + item.index + '"]'), item.type);
      });
      this.containerWidth = containerWidth;
      this.containerHeight = containerHeight;
    }
    /**
    * @typedef {Element} module:imageMaps.ShapeElement
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.ShapeElement} shapeEl
     * @param {Float} x
     * @param {Float} y
     * @returns {void}
     */


    function declareShape(shapeEl, x, y) {
      this.dragInfo.face.x = x;
      this.dragInfo.face.y = y;
      shapeEl.attr('data-movable', true);
    }
    /**
    * @typedef {PlainObject} module:imageMaps.MovedCoords
    * @property {module:imageMaps.Coords} movedCoords
    * @property {module:imageMaps.VertexCoords} vertexCoords
    * @property {module:imageMaps.ShapeElement} grabEl
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Float} x
     * @param {Float} y
     * @returns {module:imageMaps.MovedCoords|void}
     */


    function getMovedShapeCoords(x, y) {
      var shapeEl = this.shapeEl;

      if (shapeEl.attr('data-movable') === 'false') {
        return undefined;
      }

      var movedCoords = [];
      var vertexCoords = [];
      var shapeType = this.shapeType;

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        var width = Number.parseInt(shapeEl.attr('width'));
        var height = Number.parseInt(shapeEl.attr('height'));
        var movedBottomRightX = x + width;
        var movedBottomRightY = y + height;
        movedCoords = [x, y, movedBottomRightX, movedBottomRightY];
        vertexCoords = calculateVertexCoords(SHAPE.RECT, movedCoords);
      } else if (shapeType === SHAPE.CIRCLE) {
        movedCoords = [x, y, Number.parseInt(shapeEl.attr('r'))];
        vertexCoords = calculateVertexCoords(SHAPE.CIRCLE, movedCoords);
      } else if (shapeType === SHAPE.ELLIPSE) {
        movedCoords = [x, y, Number.parseInt(shapeEl.attr('rx')), Number.parseInt(shapeEl.attr('ry'))];
        vertexCoords = calculateVertexCoords(SHAPE.ELLIPSE, movedCoords);
      } else if (shapeType === SHAPE.TEXT) {
        movedCoords = [x, y];
      } else ;

      return {
        movedCoords: movedCoords,
        vertexCoords: vertexCoords,
        grabEl: shapeEl
      };
    }
    /**
    * @typedef {GenericArray} module:imageMaps.Coords
    * @property {Float} 0
    * @property {Float} 1
    * @property {Float} 2
    * @property {Float} 3
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @returns {module:imageMaps.Coords}
     */


    function determineShape() {
      var shapeEl = this.shapeEl,
          shapeType = this.shapeType;
      var updatedCoords = [];

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        var x = Number.parseInt(shapeEl.attr('x'));
        var y = Number.parseInt(shapeEl.attr('y'));
        updatedCoords = [x, y, x + Number.parseInt(shapeEl.attr('width')), y + Number.parseInt(shapeEl.attr('height'))];
      } else if (shapeType === SHAPE.CIRCLE) {
        updatedCoords = [Number.parseInt(shapeEl.attr('cx')), Number.parseInt(shapeEl.attr('cy')), Number.parseInt(shapeEl.attr('r'))];
      } else if (shapeType === SHAPE.ELLIPSE) {
        updatedCoords = [Number.parseInt(shapeEl.attr('cx')), Number.parseInt(shapeEl.attr('cy')), Number.parseInt(shapeEl.attr('rx')), Number.parseInt(shapeEl.attr('ry'))];
      } else if (shapeType === SHAPE.TEXT) {
        updatedCoords = [Number.parseInt(shapeEl.attr('x')), Number.parseInt(shapeEl.attr('y'))];
      } else ;

      return updatedCoords;
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {external:jQuery} vertexEl
     * @param {Integer} index Not currently in use
     * @returns {void}
     */


    function declareVertex(vertexEl, index) {
      this.setVertexElement(vertexEl);
      var vertexIndex = 0;
      this.vertexEls.forEach(function (item, idx) {
        if (vertexEl.get(0) === item.get(0)) {
          vertexIndex = idx;
        }
      });
      var coords = this.vertexCoords[vertexIndex];
      this.dragInfo.vertex.x = coords.x;
      this.dragInfo.vertex.y = coords.y;
      vertexEl.attr('data-movable', true);
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Float} x
     * @param {Float} y
     * @returns {module:imageMaps.MovedVertexCoords|void}
     */


    function getMovedVertexCoords(x, y) {
      if (this.vertexEl.attr('data-movable') === 'false') {
        return undefined;
      }

      var movedCoords = [];
      var vertexCoords = [];
      var shapeType = this.shapeType;
      var direction = this.vertexEl.attr('data-direction');

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE) {
        switch (direction) {
          // 좌상
          case 'nw':
            movedCoords = getValidCoordsForRect.call(this, [x, y, this.shapeCoords[2], this.shapeCoords[3]], direction);
            break;
          // 좌하

          case 'sw':
            movedCoords = getValidCoordsForRect.call(this, [x, this.shapeCoords[1], this.shapeCoords[2], y], direction);
            break;
          // 우상

          case 'ne':
            movedCoords = getValidCoordsForRect.call(this, [this.shapeCoords[0], y, x, this.shapeCoords[3]], direction);
            break;
          // 우하

          case 'se':
            movedCoords = getValidCoordsForRect.call(this, [this.shapeCoords[0], this.shapeCoords[1], x, y], direction);
            break;
          // 상

          case 'n':
            movedCoords = getValidCoordsForRect.call(this, [this.shapeCoords[0], y, this.shapeCoords[2], this.shapeCoords[3]], direction);
            break;
          // 하

          case 's':
            movedCoords = getValidCoordsForRect.call(this, [this.shapeCoords[0], this.shapeCoords[1], this.shapeCoords[2], y], direction);
            break;
          // 좌

          case 'w':
            movedCoords = getValidCoordsForRect.call(this, [x, this.shapeCoords[1], this.shapeCoords[2], this.shapeCoords[3]], direction);
            break;
          // 우

          case 'e':
            movedCoords = getValidCoordsForRect.call(this, [this.shapeCoords[0], this.shapeCoords[1], x, this.shapeCoords[3]], direction);
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn('Unexpected direction', direction);
            break;
        }
      } else if (shapeType === SHAPE.CIRCLE) {
        switch (direction) {
          case 'n':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, this.shapeCoords[1] - y)];
            break;

          case 's':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, y - this.shapeCoords[1])];
            break;

          case 'w':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, this.shapeCoords[0] - x)];
            break;

          case 'e':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, x - this.shapeCoords[0])];
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn('Unexpected direction', direction);
            break;
        }
      } else if (shapeType === SHAPE.ELLIPSE) {
        switch (direction) {
          case 'n':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], this.shapeCoords[2], getValidCoordsForCircle.call(this, this.shapeCoords[1] - y)];
            break;

          case 's':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], this.shapeCoords[2], getValidCoordsForCircle.call(this, y - this.shapeCoords[1])];
            break;

          case 'w':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, this.shapeCoords[0] - x), this.shapeCoords[3]];
            break;

          case 'e':
            movedCoords = [this.shapeCoords[0], this.shapeCoords[1], getValidCoordsForCircle.call(this, x - this.shapeCoords[0]), this.shapeCoords[3]];
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn('Unexpected direction', direction);
            break;
        }
      } else ;

      vertexCoords = calculateVertexCoords(shapeType, movedCoords);
      return {
        movedCoords: movedCoords,
        vertexCoords: vertexCoords,
        grabEl: this.vertexEl
      };
    }
    /**
    * @typedef {"se"|"sw"|"ne"|"nw"|"w"|"s"|"n"|"e"} module:imageMaps.Direction
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {module:imageMaps.RectCoords} coords
     * @param {module:imageMaps.Direction} direction
     * @returns {module:imageMaps.RectCoords}
     */


    function getValidCoordsForRect(coords, direction) {
      var _coords = _slicedToArray$1(coords, 4),
          topLeftX = _coords[0],
          topLeftY = _coords[1],
          bottomRightX = _coords[2],
          bottomRightY = _coords[3];

      if (bottomRightX - topLeftX <= this.shapeLimitCoords.x) {
        if (direction === 'se' || direction === 'ne' || direction === 'e') {
          bottomRightX = topLeftX + this.shapeLimitCoords.x;
        }

        if (direction === 'nw' || direction === 'sw' || direction === 'w') {
          topLeftX = bottomRightX - this.shapeLimitCoords.x;
        }
      }

      if (bottomRightY - topLeftY <= this.shapeLimitCoords.y) {
        if (direction === 'se' || direction === 'sw' || direction === 's') {
          bottomRightY = topLeftY + this.shapeLimitCoords.y;
        }

        if (direction === 'nw' || direction === 'ne' || direction === 'n') {
          topLeftY = bottomRightY - this.shapeLimitCoords.y;
        }
      }

      return [topLeftX, topLeftY, bottomRightX, bottomRightY];
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @this module:imageMaps~ImageMaps
     * @param {Float} coordsDiff
     * @returns {Float}
     */


    function getValidCoordsForCircle(coordsDiff) {
      var radius;

      if (coordsDiff <= this.shapeLimitCoords.radius) {
        radius = this.shapeLimitCoords.radius;
      } else {
        radius = coordsDiff;
      }

      return radius;
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.Coords} coords
     * @param {module:imageMaps.ShapeType} shapeType
     * @param {Float} widthRatio
     * @param {Float} heightRatio
     * @returns {module:imageMaps.Coords}
     */


    function getCoordsByRatio(coords, shapeType, widthRatio, heightRatio) {
      var adjustCoords = [];

      if (shapeType === SHAPE.RECT || shapeType === SHAPE.IMAGE || shapeType === SHAPE.ELLIPSE) {
        adjustCoords = [coords[0] * widthRatio, coords[1] * heightRatio, coords[2] * widthRatio, coords[3] * heightRatio];
      } else if (shapeType === SHAPE.CIRCLE) {
        var radiusRatio;
        radiusRatio = widthRatio >= heightRatio ? heightRatio : widthRatio;

        if (widthRatio === 1) {
          radiusRatio = heightRatio;
        }

        if (heightRatio === 1) {
          radiusRatio = widthRatio;
        }

        adjustCoords = [coords[0] * widthRatio, coords[1] * heightRatio, coords[2] * radiusRatio];
      } else if (shapeType === SHAPE.TEXT) {
        adjustCoords = [coords[0] * widthRatio, coords[1] * heightRatio, coords[2] * widthRatio];
      } else ;

      return adjustCoords;
    }
    /**
    * @typedef {GenericArray} module:imageMaps.RectCoords
    * @property {Float} 0
    * @property {Float} 1
    * @property {Float} 2
    * @property {Float} 3
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {module:imageMaps.ShapeElement} shapeEl
     * @returns {module:imageMaps.RectCoords}
     */


    function convertTextToRectCoords(shapeEl) {
      var bottomLeftX = Number.parseFloat(shapeEl.attr('x'));
      var bottomLeftY = Number.parseFloat(shapeEl.attr('y'));
      var shapeSize = shapeEl.get(0).getBBox();
      var width = shapeSize.width;
      var height = Number.parseFloat(shapeEl.attr('font-size')) * FONT_SIZE_RATIO / 2;
      return [bottomLeftX, bottomLeftY - height, bottomLeftX + width, bottomLeftY];
    }
    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {string} [coords]
     * @returns {?(Float[])}
     */


    function convertStringToNumber(coords) {
      if (!coords) {
        return null;
      }

      return _toConsumableArray$1(coords).map(function (ch) {
        return Number.parseFloat(ch);
      });
    } //   UTIL FUNCTIONS

    /**
     * GUID: img의 usemap 속성, map의 name 속성을 unique id로 생성.
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     * @returns {string}
     */


    function guid() {
      /**
       * @memberof module:imageMaps.jqueryImageMaps~guid.
       * @static
       * @returns {string}
       */
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    /**
    * @typedef {PlainObject} module:imageMaps.Dimensions
    * @property {Float} width
    * @property {Float} height
    */

    /**
     * @memberof module:imageMaps.jqueryImageMaps~
     * @static
     * @param {HTMLImageElement|string} imageElOrUrl
     * @todo If this is to handle an image element, other contexts which use
     *    the passed in URL should also
     * @returns {module:imageMaps.Dimensions}
     */


    function getNaturalImageSize(imageElOrUrl) {
      var imageObj = new Image();

      if ('naturalWidth' in imageObj && typeof imageElOrUrl !== 'string') {
        return {
          width: imageElOrUrl.naturalWidth,
          height: imageElOrUrl.naturalHeight
        };
      }

      if (typeof imageElOrUrl === 'string') {
        imageElOrUrl = {
          src: imageElOrUrl
        };
      }

      imageObj.src = imageElOrUrl.src;
      return {
        width: imageObj.width,
        height: imageObj.height
      };
    }

    $.fn.extend({
      /**
       * @function external:"jQuery.fn".createMaps
       * @param {?(module:imageMaps.Coords)} coords
       * @param {Url} linkUrl
       * @returns {external:jQuery}
       */
      createMaps: function createMaps(coords, linkUrl) {
        this.data('image_maps_inst').createMaps(coords, linkUrl);
        return this;
      },

      /**
       *
       * @param {external:jQuery} targetEl
       * @returns {external:jQuery}
       */
      copyImageMapsTo: function copyImageMapsTo(targetEl) {
        $.imageMaps.copyImageMaps({
          shapes: this.getAllShapes(),
          width: this.width(),
          height: this.height()
        }, targetEl);
        return this;
      },

      /**
       * @function external:"jQuery.fn".addShape
       * @param {?(module:imageMaps.Coords)} coords
       * @param {Url} linkUrl
       * @param {module:imageMaps.ShapeType} shapeType
       * @returns {external:jQuery}
       */
      addShape: function addShape(coords, linkUrl, shapeType) {
        this.data('image_maps_inst').addShape(coords, linkUrl, shapeType);
        return this;
      },

      /**
       * @function external:"jQuery.fn".removeShape
       * @param {Integer} [index]
       * @returns {external:jQuery}
       */
      removeShape: function removeShape(index) {
        this.data('image_maps_inst').removeShape(index);
        return this;
      },

      /**
       * @function external:"jQuery.fn".removeAllShapes
       * @returns {external:jQuery}
       */
      removeAllShapes: function removeAllShapes() {
        this.data('image_maps_inst').removeAllShapes();
        return this;
      },

      /**
       * @function external:"jQuery.fn".destroy
       * @returns {void}
       */
      destroy: function destroy() {
        var imageMapsObj = this.data('image_maps_inst');

        if (!imageMapsObj) {
          return;
        }

        imageMapsObj.removeImageMaps();
        this.data('image_maps_inst', null);
      },

      /**
       * @function external:"jQuery.fn".setShapeStyle
       * @param {module:imageMaps.ShapeStyles} [styleOptions]
       * @returns {external:jQuery}
       */
      setShapeStyle: function setShapeStyle(styleOptions) {
        this.data('image_maps_inst').setShapeStyle(styleOptions);
        return this;
      },

      /**
       * @function external:"jQuery.fn".setUrl
       * @param {Url} linkUrl
       * @param {Integer} index
       * @returns {external:jQuery}
       */
      setUrl: function setUrl(linkUrl, index) {
        this.data('image_maps_inst').setUrl(linkUrl, index);
        return this;
      },

      /**
       * @function external:"jQuery.fn".setTextShape
       * @param {string} text
       * @param {module:imageMaps.ShapeStyles} [styleOptions]
       * @returns {external:jQuery}
       */
      setTextShape: function setTextShape(text, styleOptions) {
        this.data('image_maps_inst').setTextShape(text, styleOptions);
        return this;
      },

      /**
       * @function external:"jQuery.fn".setImageShape
       * @param {Url} imageUrl
       * @param {module:imageMaps.ShapeStyles} [styleOptions]
       * @returns {external:jQuery}
       */
      setImageShape: function setImageShape(imageUrl, styleOptions) {
        this.data('image_maps_inst').setImageShape(imageUrl, styleOptions);
        return this;
      },

      /**
       * @function external:"jQuery.fn".enableClick
       * @returns {void}
       */
      enableClick: function enableClick() {
        this.data('image_maps_inst').enableClick();
      },

      /**
       * @function external:"jQuery.fn".disableClick
       * @returns {void}
       */
      disableClick: function disableClick() {
        this.data('image_maps_inst').disableClick();
      },

      /**
       * @function external:"jQuery.fn".getAllShapes
       * @returns {module:imageMaps.AllShapeInfo}
       */
      getAllShapes: function getAllShapes() {
        return this.data('image_maps_inst').getAllShapesInfo();
      },

      /**
       * @function external:"jQuery.fn".getCoordsByRatio
       * @param {module:imageMaps.Coords} coords
       * @param {module:imageMaps.ShapeType} shapeType
       * @param {Float} widthRatio
       * @param {Float} heightRatio
       * @returns {module:imageMaps.Coords}
       */
      getCoordsByRatio: function getCoordsByRatio(coords, shapeType, widthRatio, heightRatio) {
        return ImageMaps.getCoordsByRatio(coords, shapeType, widthRatio, heightRatio);
      },

      /**
       * @function external:"jQuery.fn".zoom
       * @param {Float[]} percentages
       * @returns {void}
       */
      zoom: function zoom(percentages) {
        this.data('image_maps_inst').zoom(percentages);
      }
    });
    $.imageMaps = {
      /**
      * @typedef {PlainObject} module:imageMaps.SourceInfo
      * @property {module:imageMaps.AllShapeInfo} shapes
      * @property {Float} width
      * @property {Float} height
      */

      /**
       * @param {module:imageMaps.SourceInfo} sourceInfo
       * @param {external:jQuery} targetEl
       * @returns {void}
       */
      copyImageMaps: function copyImageMaps(_ref3, targetEl) {
        var shapes = _ref3.shapes,
            width = _ref3.width,
            height = _ref3.height;
        targetEl.removeAllShapes();
        $.each(shapes, function (index, item) {
          targetEl.setShapeStyle(item.style);

          if (item.href) {
            targetEl.setImageShape(item.href);
          }

          if (item.text) {
            targetEl.setTextShape(item.text);
          }

          var widthRatio = width;
          var heightRatio = height;
          var newCoords = getCoordsByRatio(item.coords, item.type, targetEl.width() / widthRatio, targetEl.height() / heightRatio);
          targetEl.addShape(newCoords, item.url, item.type);
        });
      }
    };
    /**
     * @function external:"jQuery.fn".imageMaps
     * @this external:jQuery
     * @param {module:imageMaps.ImageMapOptions} [options]
     * @throws {Error}
     * @returns {module:imageMaps.ImageMaps|void}
     */

    $.fn.imageMaps = function (options) {
      if (this.length === 1) {
        if (!this.data('image_maps_inst')) {
          var imageMapsInst = new ImageMaps(this, options);
          this.data('image_maps_inst', imageMapsInst);
          return imageMapsInst;
        }

        return this.data('image_maps_inst');
      }

      if (this.length > 1) {
        throw new Error('imageMaps instance has already been created.');
      }

      return undefined;
    };

    return $;
  }

  /* globals jQuery -- No true ESM yet */

  const jq = jqueryImageMaps$1(jQuery);

  const mockFormForValidation = {
    reportValidity () {
      if (this.$message) {
        // alert(this.$message); // eslint-disable-line no-alert
        // eslint-disable-next-line no-console -- Debugging
        console.log('alert:', this.$message);
      }
    },
    setCustomValidity (msg) {
      if (!msg) {
        delete this.$message;
        return;
      }
      this.$message = msg;
    }
  };

  const jqueryImageMaps = {
    setFormObject (formObj) {
      this._formObj = formObj;
    },

    setShapeStrokeFillOptions (shapeStrokeFillOptions) {
      this._shapeStrokeFillOptions = shapeStrokeFillOptions;
    },

    async addShape (shape, {sharedBehaviors, coords}) {
      // Not sure why the timeout is necessary, but without it,
      //   the shape that is set is regularly hidden (especially
      //   when following `removeAllShapes`?); try again in case
      //   `this.src` includes default now
      await timeout(200);
      jq('img.textImageMap', this).setShapeStyle(
        this._shapeStrokeFillOptions
      ).addShape(
        coords, this.src, shape
      );
      if (sharedBehaviors) {
        const newIndex = Number.parseInt(
          jq('img.textImageMap', this).imageMaps().shapeEl.data('index')
        );
        await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
          index: newIndex,
          shape,
          coords,
          text: '',
          formObj: this._formObj,
          formControl: mockFormForValidation
        });
      }
    },

    addRect ({
      sharedBehaviors,
      coords = [10, 20, 300, 300]
    }) {
      return this.addShape('rect', {sharedBehaviors, coords});
    },

    addCircle ({
      sharedBehaviors,
      coords = [100, 100, 50]
    }) {
      return this.addShape('circle', {sharedBehaviors, coords});
    },

    async removeAllShapes ({sharedBehaviors} = {}) {
      try {
        jq('img.textImageMap', this).removeAllShapes();
        this.setFormObject({
          name: this._formObj.name,
          mapURL: this._formObj.mapURL
        });
      } catch (err) {
        // May not yet be present
      }

      if (sharedBehaviors) {
        // Reset to default empty rect shape
        await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
          index: 0,
          shape: 'rect',
          coords: ['', '', '', ''],
          text: '',
          formObj: this._formObj || {},
          formControl: mockFormForValidation,
          removeAll: true
        });
      }
    },

    async removeShape ({sharedBehaviors} = {}) {
      const imageMap = jq('img.textImageMap', this).imageMaps();
      if (imageMap.svgEl.find('._shape_face').length <= 1) {
        // Follow this routine instead which will at least set
        //   a single empty rect set rather than removing the form
        await this.removeAllShapes({sharedBehaviors});
        return;
      }

      const oldIndex = Number.parseInt(
        imageMap.shapeEl.data('index')
      );
      const {
        type: oldShapeToDelete
      } = jq('img.textImageMap', this).imageMaps().getShapeInfo(oldIndex);

      jq('img.textImageMap', this).removeShape();
      if (sharedBehaviors) {
        await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
          index: oldIndex,
          shape: undefined,
          oldShapeToDelete,
          coords: [],
          text: undefined,
          formObj: this._formObj,
          formControl: mockFormForValidation
        });
      }
    },

    setImageMaps ({formObj, mode, sharedBehaviors}) {
      this.setFormObject(formObj);
      const settings = {
        isEditMode: mode === 'edit',
        shape: 'rect',
        shapeStyle: this._shapeStrokeFillOptions,
        onClick (e, targetAreaHref) {
          // eslint-disable-next-line no-console -- Debugging
          console.log('click-targetAreaHref', targetAreaHref);
        },
        // onMouseDown (e, shapeType, coords) {},
        // We could use this but probably too aggressive
        // onMouseMove (e, shapeType, movedCoords) {},
        async onMouseUp ({target: {dataset: {index}}}, shapeType, updatedCoords) {
          const {type: shape} = this.getShapeInfo(index);

          // Won't change shape (and we don't change text here),
          //   so we only worry about coords (and only for the moved
          //   element)
          // eslint-disable-next-line no-console -- Debugging
          console.log('updatedCoords', updatedCoords);

          await sharedBehaviors.setFormObjCoordsAndUpdateViewForMap({
            index,
            shape,
            coords: updatedCoords,
            text: formObj[index + '_text'] || '',
            formObj,
            formControl: mockFormForValidation
          });
        },
        onSelect (e, data) {
          console.log(data); // eslint-disable-line no-console -- Debugging
        }
      };

      jq('img.textImageMap', this).imageMaps(settings);
      // jq('img.textImageMap', this)[mode === 'edit' ? 'show' : 'hide']();
      this.showGuidesUnlessViewMode(mode);
    },

    getImageMapInfo () {
      const imageMapElement = jq('img.textImageMap', this);
      const width = imageMapElement.width();
      const height = imageMapElement.height();
      const shapes = imageMapElement.getAllShapes();
      return {width, height, shapes};
    },

    /**
     * @typedef {PlainObject} SourceInfo
     * @property {external:imageMaps.AllShapeInfo} shapes
     * @property {Float} width
     * @property {Float} height
     */

    /**
     *
     * @param {SourceInfo} sourceInfo
     * @returns {void}
     */
    copyImageMapsToImageMap (sourceInfo) {
      jq.imageMaps.copyImageMaps(sourceInfo, jq('img.textImageMap', this));
    },

    showGuidesUnlessViewMode (mode) {
      const svg = this.querySelector('map[name] > svg');
      if (svg) {
        svg.style.visibility =
          mode !== 'view' ? 'visible' : 'hidden';
      }
    },

    zoomImageMapAndResize (val) {
      const imageMap = jq('img.textImageMap', this);
      imageMap.zoom([val]);

      // for image resize
      const textImageMap = this.querySelector('.textImageMap', this);
      textImageMap.style.width = val * 0.01 * imageMap.width();
      textImageMap.style.height = val * 0.01 * imageMap.height();
    },

    getPosition () {
      return jq('img.textImageMap', this).position();
    },

    getZoom () {
      const imageMap = jq('img.textImageMap', this);
      if (this.originalImageMapWidth === undefined) {
        this.originalImageMapWidth = imageMap.width();
        this.originalImageMapHeight = imageMap.height();
      }
      const xZoom = imageMap.width() / this.originalImageMapWidth;
      const yZoom = imageMap.height() / this.originalImageMapHeight;
      return [xZoom, yZoom];
    }
  };

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  /**
   *  Point2D.js
   *  @module Point2D
   *  @copyright 2001-2019 Kevin Lindsey
   */

  /**
   *  Point2D
   *
   *  @memberof module:kld-affine
   */
  var Point2D = /*#__PURE__*/function () {
    /**
     *  Point2D
     *
     *  @param {number} x
     *  @param {number} y
     *  @returns {module:kld-affine.Point2D}
     */
    function Point2D() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      _classCallCheck(this, Point2D);

      this.x = x;
      this.y = y;
    }
    /**
     *  clone
     *
     *  @returns {module:kld-affine.Point2D}
     */


    _createClass(Point2D, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.x, this.y);
      }
      /**
       *  add
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "add",
      value: function add(that) {
        return new this.constructor(this.x + that.x, this.y + that.y);
      }
      /**
       *  subtract
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "subtract",
      value: function subtract(that) {
        return new this.constructor(this.x - that.x, this.y - that.y);
      }
      /**
       *  multiply
       *
       *  @param {number} scalar
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "multiply",
      value: function multiply(scalar) {
        return new this.constructor(this.x * scalar, this.y * scalar);
      }
      /**
       *  divide
       *
       *  @param {number} scalar
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "divide",
      value: function divide(scalar) {
        return new this.constructor(this.x / scalar, this.y / scalar);
      }
      /**
       *  equals
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {boolean}
       */

    }, {
      key: "equals",
      value: function equals(that) {
        return this.x === that.x && this.y === that.y;
      }
      /**
       *  precisionEquals
       *
       *  @param {module:kld-affine.Point2D} that
       *  @param {number} precision
       *  @returns {boolean}
       */

    }, {
      key: "precisionEquals",
      value: function precisionEquals(that, precision) {
        return Math.abs(this.x - that.x) < precision && Math.abs(this.y - that.y) < precision;
      } // utility methods

      /**
       *  lerp
       *
       *  @param {module:kld-affine.Point2D} that
       *  @param {number} t
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "lerp",
      value: function lerp(that, t) {
        var omt = 1.0 - t;
        return new this.constructor(this.x * omt + that.x * t, this.y * omt + that.y * t);
      }
      /**
       *  distanceFrom
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {number}
       */

    }, {
      key: "distanceFrom",
      value: function distanceFrom(that) {
        var dx = this.x - that.x;
        var dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
      /**
       *  min
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {number}
       */

    }, {
      key: "min",
      value: function min(that) {
        return new this.constructor(Math.min(this.x, that.x), Math.min(this.y, that.y));
      }
      /**
       *  max
       *
       *  @param {module:kld-affine.Point2D} that
       *  @returns {number}
       */

    }, {
      key: "max",
      value: function max(that) {
        return new this.constructor(Math.max(this.x, that.x), Math.max(this.y, that.y));
      }
      /**
       *  transform
       *
       *  @param {module:kld-affine.Matrix2D} matrix
       *  @returns {module:kld-affine.Point2D}
       */

    }, {
      key: "transform",
      value: function transform(matrix) {
        return new this.constructor(matrix.a * this.x + matrix.c * this.y + matrix.e, matrix.b * this.x + matrix.d * this.y + matrix.f);
      }
      /**
       *  toString
       *
       *  @returns {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        return "point(".concat(this.x, ",").concat(this.y, ")");
      }
    }]);

    return Point2D;
  }();

  /**
   *  Vector2D.js
   *  @module Vector2D
   *  @copyright 2001-2019 Kevin Lindsey
   */

  /**
   *  Vector2D
   *
   *  @memberof module:kld-affine
   */
  var Vector2D = /*#__PURE__*/function () {
    /**
     *  Vector2D
     *
     *  @param {number} x
     *  @param {number} y
     *  @returns {module:kld-affine.Vector2D}
     */
    function Vector2D() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      _classCallCheck(this, Vector2D);

      this.x = x;
      this.y = y;
    }
    /**
     *  fromPoints
     *
     *  @param {module:kld-affine.Point2D} p1
     *  @param {module:kld-affine.Point2D} p2
     *  @returns {module:kld-affine.Vector2D}
     */


    _createClass(Vector2D, [{
      key: "length",

      /**
       *  length
       *
       *  @returns {number}
       */
      value: function length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
      /**
       *  magnitude
       *
       *  @returns {number}
       */

    }, {
      key: "magnitude",
      value: function magnitude() {
        return this.x * this.x + this.y * this.y;
      }
      /**
       *  dot
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {number}
       */

    }, {
      key: "dot",
      value: function dot(that) {
        return this.x * that.x + this.y * that.y;
      }
      /**
       *  cross
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {number}
       */

    }, {
      key: "cross",
      value: function cross(that) {
        return this.x * that.y - this.y * that.x;
      }
      /**
       *  determinant
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {number}
       */

    }, {
      key: "determinant",
      value: function determinant(that) {
        return this.x * that.y - this.y * that.x;
      }
      /**
       *  unit
       *
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "unit",
      value: function unit() {
        return this.divide(this.length());
      }
      /**
       *  add
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "add",
      value: function add(that) {
        return new this.constructor(this.x + that.x, this.y + that.y);
      }
      /**
       *  subtract
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "subtract",
      value: function subtract(that) {
        return new this.constructor(this.x - that.x, this.y - that.y);
      }
      /**
       *  multiply
       *
       *  @param {number} scalar
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "multiply",
      value: function multiply(scalar) {
        return new this.constructor(this.x * scalar, this.y * scalar);
      }
      /**
       *  divide
       *
       *  @param {number} scalar
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "divide",
      value: function divide(scalar) {
        return new this.constructor(this.x / scalar, this.y / scalar);
      }
      /**
       *  angleBetween
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {number}
       */

    }, {
      key: "angleBetween",
      value: function angleBetween(that) {
        var cos = this.dot(that) / (this.length() * that.length());
        cos = Math.max(-1, Math.min(cos, 1));
        var radians = Math.acos(cos);
        return this.cross(that) < 0.0 ? -radians : radians;
      }
      /**
       *  Find a vector is that is perpendicular to this vector
       *
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "perp",
      value: function perp() {
        return new this.constructor(-this.y, this.x);
      }
      /**
       *  Find the component of the specified vector that is perpendicular to
       *  this vector
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "perpendicular",
      value: function perpendicular(that) {
        return this.subtract(this.project(that));
      }
      /**
       *  project
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "project",
      value: function project(that) {
        var percent = this.dot(that) / that.dot(that);
        return that.multiply(percent);
      }
      /**
       *  transform
       *
       *  @param {module:kld-affine.Matrix2D} matrix
       *  @returns {module:kld-affine.Vector2D}
       */

    }, {
      key: "transform",
      value: function transform(matrix) {
        return new this.constructor(matrix.a * this.x + matrix.c * this.y, matrix.b * this.x + matrix.d * this.y);
      }
      /**
       *  equals
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @returns {boolean}
       */

    }, {
      key: "equals",
      value: function equals(that) {
        return this.x === that.x && this.y === that.y;
      }
      /**
       *  precisionEquals
       *
       *  @param {module:kld-affine.Vector2D} that
       *  @param {number} precision
       *  @returns {boolean}
       */

    }, {
      key: "precisionEquals",
      value: function precisionEquals(that, precision) {
        return Math.abs(this.x - that.x) < precision && Math.abs(this.y - that.y) < precision;
      }
      /**
       *  toString
       *
       *  @returns {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        return "vector(".concat(this.x, ",").concat(this.y, ")");
      }
    }], [{
      key: "fromPoints",
      value: function fromPoints(p1, p2) {
        return new Vector2D(p2.x - p1.x, p2.y - p1.y);
      }
    }]);

    return Vector2D;
  }();

  /**
   *  Matrix2D.js
   *  @module Matrix2D
   *  @copyright 2001-2019 Kevin Lindsey
   */

  /**
   *  Matrix2D
   *
   *  @memberof module:kld-affine
   */
  var Matrix2D = /*#__PURE__*/function () {
    /**
     *  A 2D Matrix of the form:<br>
     *  [a c e]<br>
     *  [b d f]<br>
     *  [0 0 1]<br>
     *
     *  @param {number} a
     *  @param {number} b
     *  @param {number} c
     *  @param {number} d
     *  @param {number} e
     *  @param {number} f
     *  @returns {module:kld-affine.Matrix2D}
     */
    function Matrix2D() {
      var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var d = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var e = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var f = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

      _classCallCheck(this, Matrix2D);

      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.f = f;
    }
    /**
     *  translation
     *
     *  @param {number} tx
     *  @param {number} ty
     *  @returns {module:kld-affine.Matrix2D}
     */


    _createClass(Matrix2D, [{
      key: "multiply",

      /**
       *  multiply
       *
       *  @param {module:kld-affine.Matrix2D} that
       *  @returns {module:kld-affine.Matrix2D}
       */
      value: function multiply(that) {
        if (this.isIdentity()) {
          return that;
        }

        if (that.isIdentity()) {
          return this;
        }

        return new this.constructor(this.a * that.a + this.c * that.b, this.b * that.a + this.d * that.b, this.a * that.c + this.c * that.d, this.b * that.c + this.d * that.d, this.a * that.e + this.c * that.f + this.e, this.b * that.e + this.d * that.f + this.f);
      }
      /**
       *  inverse
       *
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "inverse",
      value: function inverse() {
        if (this.isIdentity()) {
          return this;
        }

        var det1 = this.a * this.d - this.b * this.c;

        if (det1 === 0.0) {
          throw new Error("Matrix is not invertible");
        }

        var idet = 1.0 / det1;
        var det2 = this.f * this.c - this.e * this.d;
        var det3 = this.e * this.b - this.f * this.a;
        return new this.constructor(this.d * idet, -this.b * idet, -this.c * idet, this.a * idet, det2 * idet, det3 * idet);
      }
      /**
       *  translate
       *
       *  @param {number} tx
       *  @param {number} ty
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "translate",
      value: function translate(tx, ty) {
        return new this.constructor(this.a, this.b, this.c, this.d, this.a * tx + this.c * ty + this.e, this.b * tx + this.d * ty + this.f);
      }
      /**
       *  scale
       *
       *  @param {number} scale
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scale",
      value: function scale(_scale) {
        return new this.constructor(this.a * _scale, this.b * _scale, this.c * _scale, this.d * _scale, this.e, this.f);
      }
      /**
       *  scaleAt
       *
       *  @param {number} scale
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scaleAt",
      value: function scaleAt(scale, center) {
        var dx = center.x - scale * center.x;
        var dy = center.y - scale * center.y;
        return new this.constructor(this.a * scale, this.b * scale, this.c * scale, this.d * scale, this.a * dx + this.c * dy + this.e, this.b * dx + this.d * dy + this.f);
      }
      /**
       *  scaleNonUniform
       *
       *  @param {number} scaleX
       *  @param {number} scaleY
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scaleNonUniform",
      value: function scaleNonUniform(scaleX, scaleY) {
        return new this.constructor(this.a * scaleX, this.b * scaleX, this.c * scaleY, this.d * scaleY, this.e, this.f);
      }
      /**
       *  scaleNonUniformAt
       *
       *  @param {number} scaleX
       *  @param {number} scaleY
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scaleNonUniformAt",
      value: function scaleNonUniformAt(scaleX, scaleY, center) {
        var dx = center.x - scaleX * center.x;
        var dy = center.y - scaleY * center.y;
        return new this.constructor(this.a * scaleX, this.b * scaleX, this.c * scaleY, this.d * scaleY, this.a * dx + this.c * dy + this.e, this.b * dx + this.d * dy + this.f);
      }
      /**
       *  rotate
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotate",
      value: function rotate(radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return new this.constructor(this.a * c + this.c * s, this.b * c + this.d * s, this.a * -s + this.c * c, this.b * -s + this.d * c, this.e, this.f);
      }
      /**
       *  rotateAt
       *
       *  @param {number} radians
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotateAt",
      value: function rotateAt(radians, center) {
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var cx = center.x;
        var cy = center.y;
        var a = this.a * cos + this.c * sin;
        var b = this.b * cos + this.d * sin;
        var c = this.c * cos - this.a * sin;
        var d = this.d * cos - this.b * sin;
        return new this.constructor(a, b, c, d, (this.a - a) * cx + (this.c - c) * cy + this.e, (this.b - b) * cx + (this.d - d) * cy + this.f);
      }
      /**
       *  rotateFromVector
       *
       *  @param {module:kld-affine.Vector2D} vector
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotateFromVector",
      value: function rotateFromVector(vector) {
        var unit = vector.unit();
        var c = unit.x; // cos

        var s = unit.y; // sin

        return new this.constructor(this.a * c + this.c * s, this.b * c + this.d * s, this.a * -s + this.c * c, this.b * -s + this.d * c, this.e, this.f);
      }
      /**
       *  flipX
       *
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "flipX",
      value: function flipX() {
        return new this.constructor(-this.a, -this.b, this.c, this.d, this.e, this.f);
      }
      /**
       *  flipY
       *
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "flipY",
      value: function flipY() {
        return new this.constructor(this.a, this.b, -this.c, -this.d, this.e, this.f);
      }
      /**
       *  skewX
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "skewX",
      value: function skewX(radians) {
        var t = Math.tan(radians);
        return new this.constructor(this.a, this.b, this.c + this.a * t, this.d + this.b * t, this.e, this.f);
      } // TODO: skewXAt

      /**
       *  skewY
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "skewY",
      value: function skewY(radians) {
        var t = Math.tan(radians);
        return new this.constructor(this.a + this.c * t, this.b + this.d * t, this.c, this.d, this.e, this.f);
      } // TODO: skewYAt

      /**
       *  isIdentity
       *
       *  @returns {boolean}
       */

    }, {
      key: "isIdentity",
      value: function isIdentity() {
        return this.a === 1.0 && this.b === 0.0 && this.c === 0.0 && this.d === 1.0 && this.e === 0.0 && this.f === 0.0;
      }
      /**
       *  isInvertible
       *
       *  @returns {boolean}
       */

    }, {
      key: "isInvertible",
      value: function isInvertible() {
        return this.a * this.d - this.b * this.c !== 0.0;
      }
      /**
       *  getScale
       *
       *  @returns {{ scaleX: number, scaleY: number }}
       */

    }, {
      key: "getScale",
      value: function getScale() {
        return {
          scaleX: Math.sqrt(this.a * this.a + this.c * this.c),
          scaleY: Math.sqrt(this.b * this.b + this.d * this.d)
        };
      }
      /**
       *  Calculates matrix Singular Value Decomposition
       *
       *  The resulting matrices — translation, rotation, scale, and rotation0 — return
       *  this matrix when they are multiplied together in the listed order
       *
       *  @see Jim Blinn's article {@link http://dx.doi.org/10.1109/38.486688}
       *  @see {@link http://math.stackexchange.com/questions/861674/decompose-a-2d-arbitrary-transform-into-only-scaling-and-rotation}
       *
       *  @returns {{
       *    translation: module:kld-affine.Matrix2D,
       *    rotation: module:kld-affine.Matrix2D,
       *    scale: module:kld-affine.Matrix2D,
       *    rotation0: module:kld-affine.Matrix2D
       *  }}
       */

    }, {
      key: "getDecomposition",
      value: function getDecomposition() {
        var E = (this.a + this.d) * 0.5;
        var F = (this.a - this.d) * 0.5;
        var G = (this.b + this.c) * 0.5;
        var H = (this.b - this.c) * 0.5;
        var Q = Math.sqrt(E * E + H * H);
        var R = Math.sqrt(F * F + G * G);
        var scaleX = Q + R;
        var scaleY = Q - R;
        var a1 = Math.atan2(G, F);
        var a2 = Math.atan2(H, E);
        var theta = (a2 - a1) * 0.5;
        var phi = (a2 + a1) * 0.5;
        return {
          translation: this.constructor.translation(this.e, this.f),
          rotation: this.constructor.rotation(phi),
          scale: this.constructor.nonUniformScaling(scaleX, scaleY),
          rotation0: this.constructor.rotation(theta)
        };
      }
      /**
       *  equals
       *
       *  @param {module:kld-affine.Matrix2D} that
       *  @returns {boolean}
       */

    }, {
      key: "equals",
      value: function equals(that) {
        return this.a === that.a && this.b === that.b && this.c === that.c && this.d === that.d && this.e === that.e && this.f === that.f;
      }
      /**
       *  precisionEquals
       *
       *  @param {module:kld-affine.Matrix2D} that
       *  @param {number} precision
       *  @returns {boolean}
       */

    }, {
      key: "precisionEquals",
      value: function precisionEquals(that, precision) {
        return Math.abs(this.a - that.a) < precision && Math.abs(this.b - that.b) < precision && Math.abs(this.c - that.c) < precision && Math.abs(this.d - that.d) < precision && Math.abs(this.e - that.e) < precision && Math.abs(this.f - that.f) < precision;
      }
      /**
       *  toString
       *
       *  @returns {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        return "matrix(".concat(this.a, ",").concat(this.b, ",").concat(this.c, ",").concat(this.d, ",").concat(this.e, ",").concat(this.f, ")");
      }
    }], [{
      key: "translation",
      value: function translation(tx, ty) {
        return new Matrix2D(1, 0, 0, 1, tx, ty);
      }
      /**
       *  scaling
       *
       *  @param {number} scale
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scaling",
      value: function scaling(scale) {
        return new Matrix2D(scale, 0, 0, scale, 0, 0);
      }
      /**
       *  scalingAt
       *
       *  @param {number} scale
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "scalingAt",
      value: function scalingAt(scale, center) {
        return new Matrix2D(scale, 0, 0, scale, center.x - center.x * scale, center.y - center.y * scale);
      }
      /**
       *  nonUniformScaling
       *
       *  @param {number} scaleX
       *  @param {number} scaleY
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "nonUniformScaling",
      value: function nonUniformScaling(scaleX, scaleY) {
        return new Matrix2D(scaleX, 0, 0, scaleY, 0, 0);
      }
      /**
       *  nonUniformScalingAt
       *
       *  @param {number} scaleX
       *  @param {number} scaleY
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "nonUniformScalingAt",
      value: function nonUniformScalingAt(scaleX, scaleY, center) {
        return new Matrix2D(scaleX, 0, 0, scaleY, center.x - center.x * scaleX, center.y - center.y * scaleY);
      }
      /**
       *  rotation
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotation",
      value: function rotation(radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return new Matrix2D(c, s, -s, c, 0, 0);
      }
      /**
       *  rotationAt
       *
       *  @param {number} radians
       *  @param {module:kld-affine.Point2D} center
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotationAt",
      value: function rotationAt(radians, center) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        return new Matrix2D(c, s, -s, c, center.x - center.x * c + center.y * s, center.y - center.y * c - center.x * s);
      }
      /**
       *  rotationFromVector
       *
       *  @param {module:kld-affine.Vector2D} vector
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "rotationFromVector",
      value: function rotationFromVector(vector) {
        var unit = vector.unit();
        var c = unit.x; // cos

        var s = unit.y; // sin

        return new Matrix2D(c, s, -s, c, 0, 0);
      }
      /**
       *  xFlip
       *
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "xFlip",
      value: function xFlip() {
        return new Matrix2D(-1, 0, 0, 1, 0, 0);
      }
      /**
       *  yFlip
       *
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "yFlip",
      value: function yFlip() {
        return new Matrix2D(1, 0, 0, -1, 0, 0);
      }
      /**
       *  xSkew
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "xSkew",
      value: function xSkew(radians) {
        var t = Math.tan(radians);
        return new Matrix2D(1, 0, t, 1, 0, 0);
      }
      /**
       *  ySkew
       *
       *  @param {number} radians
       *  @returns {module:kld-affine.Matrix2D}
       */

    }, {
      key: "ySkew",
      value: function ySkew(radians) {
        var t = Math.tan(radians);
        return new Matrix2D(1, t, 0, 1, 0, 0);
      }
    }]);

    return Matrix2D;
  }();
  /**
   *  Identity matrix
   *
   *  @returns {module:kld-affine.Matrix2D}
   */


  Matrix2D.IDENTITY = new Matrix2D();

  Matrix2D.IDENTITY.isIdentity = function () {
    return true;
  };

  /* eslint-disable camelcase */

  /**
   *  Polynomial.js
   *
   *  @module Polynomial
   *  @copyright 2002-2019 Kevin Lindsey<br>
   *  -<br>
   *  Contribution {@link http://github.com/Quazistax/kld-polynomial}<br>
   *  copyright 2015 Robert Benko (Quazistax) <quazistax@gmail.com><br>
   *  MIT license
   */

  /**
   *  Sign of a number (+1, -1, +0, -0).
   *
   *  @param {number} x
   *  @returns {number}
   */
  function sign(x) {
    // eslint-disable-next-line no-self-compare
    return typeof x === "number" ? x ? x < 0 ? -1 : 1 : x === x ? x : NaN : NaN;
  }
  /**
   *  Polynomial
   *
   *  @memberof module:kld-polynomial
   */


  var Polynomial = /*#__PURE__*/function () {
    /**
     *  Polynomial
     *
     *  @param {Array<number>} coefs
     *  @returns {module:kld-polynomial.Polynomial}
     */
    function Polynomial() {
      _classCallCheck(this, Polynomial);

      this.coefs = [];

      for (var i = arguments.length - 1; i >= 0; i--) {
        this.coefs.push(i < 0 || arguments.length <= i ? undefined : arguments[i]);
      }

      this._variable = "t";
      this._s = 0;
    }
    /**
     *  Based on polint in "Numerical Recipes in C, 2nd Edition", pages 109-110
     *
     *  @param {Array<number>} xs
     *  @param {Array<number>} ys
     *  @param {number} n
     *  @param {number} offset
     *  @param {number} x
     *
     *  @returns {{y: number, dy: number}}
     */


    _createClass(Polynomial, [{
      key: "clone",

      /**
       *  Clones this polynomial and return the clone.
       *
       *  @returns {module:kld-polynomial.Polynomial}
       */
      value: function clone() {
        var poly = new Polynomial();
        poly.coefs = this.coefs.slice();
        return poly;
      }
      /**
       *  eval
       *
       *  @param {number} x
       */

    }, {
      key: "eval",
      value: function _eval(x) {
        if (isNaN(x)) {
          throw new TypeError("Parameter must be a number. Found '".concat(x, "'"));
        }

        var result = 0;

        for (var i = this.coefs.length - 1; i >= 0; i--) {
          result = result * x + this.coefs[i];
        }

        return result;
      }
      /**
       *  add
       *
       *  @param {module:kld-polynomial.Polynomial} that
       *  @returns {module:kld-polynomial.Polynomial}
       */

    }, {
      key: "add",
      value: function add(that) {
        var result = new Polynomial();
        var d1 = this.getDegree();
        var d2 = that.getDegree();
        var dmax = Math.max(d1, d2);

        for (var i = 0; i <= dmax; i++) {
          var v1 = i <= d1 ? this.coefs[i] : 0;
          var v2 = i <= d2 ? that.coefs[i] : 0;
          result.coefs[i] = v1 + v2;
        }

        return result;
      }
      /**
       *  multiply
       *
       *  @param {module:kld-polynomial.Polynomial} that
       *  @returns {module:kld-polynomial.Polynomial}
       */

    }, {
      key: "multiply",
      value: function multiply(that) {
        var result = new Polynomial();

        for (var i = 0; i <= this.getDegree() + that.getDegree(); i++) {
          result.coefs.push(0);
        }

        for (var _i = 0; _i <= this.getDegree(); _i++) {
          for (var j = 0; j <= that.getDegree(); j++) {
            result.coefs[_i + j] += this.coefs[_i] * that.coefs[j];
          }
        }

        return result;
      }
      /**
       *  divideEqualsScalar
       *
       *  @deprecated To be replaced by divideScalar
       *  @param {number} scalar
       */

    }, {
      key: "divideEqualsScalar",
      value: function divideEqualsScalar(scalar) {
        for (var i = 0; i < this.coefs.length; i++) {
          this.coefs[i] /= scalar;
        }
      }
      /**
       *  simplifyEquals
       *
       *  @deprecated To be replaced by simplify
       *  @param {number} TOLERANCE
       */

    }, {
      key: "simplifyEquals",
      value: function simplifyEquals() {
        var TOLERANCE = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1e-12;

        for (var i = this.getDegree(); i >= 0; i--) {
          if (Math.abs(this.coefs[i]) <= TOLERANCE) {
            this.coefs.pop();
          } else {
            break;
          }
        }
      }
      /**
       *  Sets small coefficients to zero.
       *
       *  @deprecated To be replaced by removeZeros
       *  @param {number} TOLERANCE
       *  @returns {module:kld-polynomial.Polynomial}
       */

    }, {
      key: "removeZerosEquals",
      value: function removeZerosEquals() {
        var TOLERANCE = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1e-15;
        var c = this.coefs;
        var err = 10 * TOLERANCE * Math.abs(c.reduce(function (pv, cv) {
          return Math.abs(cv) > Math.abs(pv) ? cv : pv;
        }));

        for (var i = 0; i < c.length - 1; i++) {
          if (Math.abs(c[i]) < err) {
            c[i] = 0;
          }
        }

        return this;
      }
      /**
       *  Scales polynomial so that leading coefficient becomes 1.
       *
       *  @deprecated To be replaced by getMonic
       *  @returns {module:kld-polynomial.Polynomial}
       */

    }, {
      key: "monicEquals",
      value: function monicEquals() {
        var c = this.coefs;

        if (c[c.length - 1] !== 1) {
          this.divideEqualsScalar(c[c.length - 1]);
        }

        return this;
      }
      /**
       *  toString
       *
       *  @returns {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        var coefs = [];
        var signs = [];

        for (var i = this.coefs.length - 1; i >= 0; i--) {
          var value = Math.round(this.coefs[i] * 1000) / 1000;

          if (value !== 0) {
            var signString = value < 0 ? " - " : " + ";
            value = Math.abs(value);

            if (i > 0) {
              if (value === 1) {
                value = this._variable;
              } else {
                value += this._variable;
              }
            }

            if (i > 1) {
              value += "^" + i;
            }

            signs.push(signString);
            coefs.push(value);
          }
        }

        signs[0] = signs[0] === " + " ? "" : "-";
        var result = "";

        for (var _i2 = 0; _i2 < coefs.length; _i2++) {
          result += signs[_i2] + coefs[_i2];
        }

        return result;
      }
      /**
       *  bisection
       *
       *  @param {number} min
       *  @param {number} max
       *  @param {number} [TOLERANCE]
       *  @param {number} [ACCURACY]
       *  @returns {number}
       */

    }, {
      key: "bisection",
      value: function bisection(min, max) {
        var TOLERANCE = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1e-6;
        var ACCURACY = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 15;
        var minValue = this.eval(min);
        var maxValue = this.eval(max);
        var result;

        if (Math.abs(minValue) <= TOLERANCE) {
          result = min;
        } else if (Math.abs(maxValue) <= TOLERANCE) {
          result = max;
        } else if (minValue * maxValue <= 0) {
          var tmp1 = Math.log(max - min);
          var tmp2 = Math.LN10 * ACCURACY;
          var maxIterations = Math.ceil((tmp1 + tmp2) / Math.LN2);

          for (var i = 0; i < maxIterations; i++) {
            result = 0.5 * (min + max);
            var value = this.eval(result);

            if (Math.abs(value) <= TOLERANCE) {
              break;
            }

            if (value * minValue < 0) {
              max = result;
              maxValue = value;
            } else {
              min = result;
              minValue = value;
            }
          }
        }

        return result;
      }
      /**
       *  Based on trapzd in "Numerical Recipes in C, 2nd Edition", page 137
       *
       *  @param {number} min
       *  @param {number} max
       *  @param {number} n
       *  @returns {number}
       */

    }, {
      key: "trapezoid",
      value: function trapezoid(min, max, n) {
        if (isNaN(min) || isNaN(max) || isNaN(n)) {
          throw new TypeError("Parameters must be numbers");
        }

        var range = max - min;

        if (n === 1) {
          var minValue = this.eval(min);
          var maxValue = this.eval(max);
          this._s = 0.5 * range * (minValue + maxValue);
        } else {
          var iter = 1 << n - 2;
          var delta = range / iter;
          var x = min + 0.5 * delta;
          var sum = 0;

          for (var i = 0; i < iter; i++) {
            sum += this.eval(x);
            x += delta;
          }

          this._s = 0.5 * (this._s + range * sum / iter);
        }

        if (isNaN(this._s)) {
          throw new TypeError("this._s is NaN");
        }

        return this._s;
      }
      /**
       *  Based on trapzd in "Numerical Recipes in C, 2nd Edition", page 139
       *
       *  @param {number} min
       *  @param {number} max
       *  @returns {number}
       */

    }, {
      key: "simpson",
      value: function simpson(min, max) {
        if (isNaN(min) || isNaN(max)) {
          throw new TypeError("Parameters must be numbers");
        }

        var range = max - min;
        var st = 0.5 * range * (this.eval(min) + this.eval(max));
        var t = st;
        var s = 4.0 * st / 3.0;
        var os = s;
        var ost = st;
        var TOLERANCE = 1e-7;
        var iter = 1;

        for (var n = 2; n <= 20; n++) {
          var delta = range / iter;
          var x = min + 0.5 * delta;
          var sum = 0;

          for (var i = 1; i <= iter; i++) {
            sum += this.eval(x);
            x += delta;
          }

          t = 0.5 * (t + range * sum / iter);
          st = t;
          s = (4.0 * st - ost) / 3.0;

          if (Math.abs(s - os) < TOLERANCE * Math.abs(os)) {
            break;
          }

          os = s;
          ost = st;
          iter <<= 1;
        }

        return s;
      }
      /**
       *  romberg
       *
       *  @param {number} min
       *  @param {number} max
       *  @returns {number}
       */

    }, {
      key: "romberg",
      value: function romberg(min, max) {
        if (isNaN(min) || isNaN(max)) {
          throw new TypeError("Parameters must be numbers");
        }

        var MAX = 20;
        var K = 3;
        var TOLERANCE = 1e-6;
        var s = new Array(MAX + 1);
        var h = new Array(MAX + 1);
        var result = {
          y: 0,
          dy: 0
        };
        h[0] = 1.0;

        for (var j = 1; j <= MAX; j++) {
          s[j - 1] = this.trapezoid(min, max, j);

          if (j >= K) {
            result = Polynomial.interpolate(h, s, K, j - K, 0.0);

            if (Math.abs(result.dy) <= TOLERANCE * result.y) {
              break;
            }
          }

          s[j] = s[j - 1];
          h[j] = 0.25 * h[j - 1];
        }

        return result.y;
      }
      /**
       *  Estimate what is the maximum polynomial evaluation error value under which polynomial evaluation could be in fact 0.
       *
       *  @param {number} maxAbsX
       *  @returns {number}
       */

    }, {
      key: "zeroErrorEstimate",
      value: function zeroErrorEstimate(maxAbsX) {
        var poly = this;
        var ERRF = 1e-15;

        if (typeof maxAbsX === "undefined") {
          var rb = poly.bounds();
          maxAbsX = Math.max(Math.abs(rb.minX), Math.abs(rb.maxX));
        }

        if (maxAbsX < 0.001) {
          return 2 * Math.abs(poly.eval(ERRF));
        }

        var n = poly.coefs.length - 1;
        var an = poly.coefs[n];
        return 10 * ERRF * poly.coefs.reduce(function (m, v, i) {
          var nm = v / an * Math.pow(maxAbsX, i);
          return nm > m ? nm : m;
        }, 0);
      }
      /**
       *  Calculates upper Real roots bounds. <br/>
       *  Real roots are in interval [negX, posX]. Determined by Fujiwara method.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {{ negX: number, posX: number }}
       */

    }, {
      key: "boundsUpperRealFujiwara",
      value: function boundsUpperRealFujiwara() {
        var a = this.coefs;
        var n = a.length - 1;
        var an = a[n];

        if (an !== 1) {
          a = this.coefs.map(function (v) {
            return v / an;
          });
        }

        var b = a.map(function (v, i) {
          return i < n ? Math.pow(Math.abs(i === 0 ? v / 2 : v), 1 / (n - i)) : v;
        });
        var coefSelectionFunc;

        var find2Max = function find2Max(acc, bi, i) {
          if (coefSelectionFunc(i)) {
            if (acc.max < bi) {
              acc.nearmax = acc.max;
              acc.max = bi;
            } else if (acc.nearmax < bi) {
              acc.nearmax = bi;
            }
          }

          return acc;
        };

        coefSelectionFunc = function coefSelectionFunc(i) {
          return i < n && a[i] < 0;
        }; // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


        var max_nearmax_pos = b.reduce(find2Max, {
          max: 0,
          nearmax: 0
        });

        coefSelectionFunc = function coefSelectionFunc(i) {
          return i < n && (n % 2 === i % 2 ? a[i] < 0 : a[i] > 0);
        }; // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


        var max_nearmax_neg = b.reduce(find2Max, {
          max: 0,
          nearmax: 0
        });
        return {
          negX: -2 * max_nearmax_neg.max,
          posX: 2 * max_nearmax_pos.max
        };
      }
      /**
       *  Calculates lower Real roots bounds. <br/>
       *  There are no Real roots in interval <negX, posX>. Determined by Fujiwara method.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {{ negX: number, posX: number }}
       */

    }, {
      key: "boundsLowerRealFujiwara",
      value: function boundsLowerRealFujiwara() {
        var poly = new Polynomial();
        poly.coefs = this.coefs.slice().reverse();
        var res = poly.boundsUpperRealFujiwara();
        res.negX = 1 / res.negX;
        res.posX = 1 / res.posX;
        return res;
      }
      /**
       *  Calculates left and right Real roots bounds. <br/>
       *  Real roots are in interval [minX, maxX]. Combines Fujiwara lower and upper bounds to get minimal interval.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {{ minX: number, maxX: number }}
      */

    }, {
      key: "bounds",
      value: function bounds() {
        var urb = this.boundsUpperRealFujiwara();
        var rb = {
          minX: urb.negX,
          maxX: urb.posX
        };

        if (urb.negX === 0 && urb.posX === 0) {
          return rb;
        }

        if (urb.negX === 0) {
          rb.minX = this.boundsLowerRealFujiwara().posX;
        } else if (urb.posX === 0) {
          rb.maxX = this.boundsLowerRealFujiwara().negX;
        }

        if (rb.minX > rb.maxX) {
          rb.minX = rb.maxX = 0;
        }

        return rb; // TODO: if sure that there are no complex roots
        // (maybe by using Sturm's theorem) use:
        // return this.boundsRealLaguerre();
      }
      /**
       *  Calculates absolute upper roots bound. <br/>
       *  All (Complex and Real) roots magnitudes are &lt;= result. Determined by Rouche method.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {number}
       */

    }, {
      key: "boundUpperAbsRouche",
      value: function boundUpperAbsRouche() {
        var a = this.coefs;
        var n = a.length - 1;
        var max = a.reduce(function (prev, curr, i) {
          if (i !== n) {
            curr = Math.abs(curr);
            return prev < curr ? curr : prev;
          }

          return prev;
        }, 0);
        return 1 + max / Math.abs(a[n]);
      }
      /**
       *  Calculates absolute lower roots bound. <br/>
       *  All (Complex and Real) roots magnitudes are &gt;= result. Determined by Rouche method.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {number}
       */

    }, {
      key: "boundLowerAbsRouche",
      value: function boundLowerAbsRouche() {
        var a = this.coefs;
        var max = a.reduce(function (prev, curr, i) {
          if (i !== 0) {
            curr = Math.abs(curr);
            return prev < curr ? curr : prev;
          }

          return prev;
        }, 0);
        return Math.abs(a[0]) / (Math.abs(a[0]) + max);
      }
      /**
       *  Calculates left and right Real roots bounds.<br/>
       *  WORKS ONLY if all polynomial roots are Real.
       *  Real roots are in interval [minX, maxX]. Determined by Laguerre method.
       *  @see {@link http://en.wikipedia.org/wiki/Properties_of_polynomial_roots}
       *
       *  @returns {{ minX: number, maxX: number }}
       */

    }, {
      key: "boundsRealLaguerre",
      value: function boundsRealLaguerre() {
        var a = this.coefs;
        var n = a.length - 1;
        var p1 = -a[n - 1] / (n * a[n]);
        var undersqrt = a[n - 1] * a[n - 1] - 2 * n / (n - 1) * a[n] * a[n - 2];
        var p2 = (n - 1) / (n * a[n]) * Math.sqrt(undersqrt);

        if (p2 < 0) {
          p2 = -p2;
        }

        return {
          minX: p1 - p2,
          maxX: p1 + p2
        };
      }
      /**
       *  Root count by Descartes rule of signs. <br/>
       *  Returns maximum number of positive and negative real roots and minimum number of complex roots.
       *  @see {@link http://en.wikipedia.org/wiki/Descartes%27_rule_of_signs}
       *
       *  @returns {{maxRealPos: number, maxRealNeg: number, minComplex: number}}
       */

    }, {
      key: "countRootsDescartes",
      value: function countRootsDescartes() {
        var a = this.coefs;
        var n = a.length - 1;
        var accum = a.reduce(function (acc, ai, i) {
          if (acc.prev_a !== 0 && ai !== 0) {
            if (acc.prev_a < 0 === ai > 0) {
              acc.pos++;
            }

            if (i % 2 === 0 !== acc.prev_a < 0 === (i % 2 === 1 !== ai > 0)) {
              acc.neg++;
            }
          }

          acc.prev_a = ai;
          return acc;
        }, {
          pos: 0,
          neg: 0,
          prev_a: 0
        });
        return {
          maxRealPos: accum.pos,
          maxRealNeg: accum.neg,
          minComplex: n - (accum.pos + accum.neg)
        };
      } // getters and setters

      /**
       *  get degree
       *
       *  @returns {number}
       */

    }, {
      key: "getDegree",
      value: function getDegree() {
        return this.coefs.length - 1;
      }
      /**
       *  getDerivative
       *
       *  @returns {module:kld-polynomial.Polynomial}
       */

    }, {
      key: "getDerivative",
      value: function getDerivative() {
        var derivative = new Polynomial();

        for (var i = 1; i < this.coefs.length; i++) {
          derivative.coefs.push(i * this.coefs[i]);
        }

        return derivative;
      }
      /**
       *  getRoots
       *
       *  @returns {Array<number>}
       */

    }, {
      key: "getRoots",
      value: function getRoots() {
        var result;
        this.simplifyEquals();

        switch (this.getDegree()) {
          case 0:
            result = [];
            break;

          case 1:
            result = this.getLinearRoot();
            break;

          case 2:
            result = this.getQuadraticRoots();
            break;

          case 3:
            result = this.getCubicRoots();
            break;

          case 4:
            result = this.getQuarticRoots();
            break;

          default:
            result = [];
        }

        return result;
      }
      /**
       *  getRootsInInterval
       *
       *  @param {number} min
       *  @param {number} max
       *  @returns {Array<number>}
       */

    }, {
      key: "getRootsInInterval",
      value: function getRootsInInterval(min, max) {
        var roots = [];
        /**
         *  @param {number} value
         */

        function push(value) {
          if (typeof value === "number") {
            roots.push(value);
          }
        }

        if (this.getDegree() === 0) {
          throw new RangeError("Unexpected empty polynomial");
        } else if (this.getDegree() === 1) {
          push(this.bisection(min, max));
        } else {
          // get roots of derivative
          var deriv = this.getDerivative();
          var droots = deriv.getRootsInInterval(min, max);

          if (droots.length > 0) {
            // find root on [min, droots[0]]
            push(this.bisection(min, droots[0])); // find root on [droots[i],droots[i+1]] for 0 <= i <= count-2

            for (var i = 0; i <= droots.length - 2; i++) {
              push(this.bisection(droots[i], droots[i + 1]));
            } // find root on [droots[count-1],xmax]


            push(this.bisection(droots[droots.length - 1], max));
          } else {
            // polynomial is monotone on [min,max], has at most one root
            push(this.bisection(min, max));
          }
        }

        return roots;
      }
      /**
       *  getLinearRoot
       *
       *  @returns {number}
       */

    }, {
      key: "getLinearRoot",
      value: function getLinearRoot() {
        var result = [];
        var a = this.coefs[1];

        if (a !== 0) {
          result.push(-this.coefs[0] / a);
        }

        return result;
      }
      /**
       *  getQuadraticRoots
       *
       *  @returns {Array<number>}
       */

    }, {
      key: "getQuadraticRoots",
      value: function getQuadraticRoots() {
        var results = [];

        if (this.getDegree() === 2) {
          var a = this.coefs[2];
          var b = this.coefs[1] / a;
          var c = this.coefs[0] / a;
          var d = b * b - 4 * c;

          if (d > 0) {
            var e = Math.sqrt(d);
            results.push(0.5 * (-b + e));
            results.push(0.5 * (-b - e));
          } else if (d === 0) {
            // really two roots with same value, but we only return one
            results.push(0.5 * -b);
          } // else imaginary results

        }

        return results;
      }
      /**
       *  getCubicRoots
       *
       *  This code is based on MgcPolynomial.cpp written by David Eberly.  His
       *  code along with many other excellent examples are avaiable at his site:
       *  http://www.geometrictools.com
       *
       *  @returns {Array<number>}
       */

    }, {
      key: "getCubicRoots",
      value: function getCubicRoots() {
        var results = [];

        if (this.getDegree() === 3) {
          var c3 = this.coefs[3];
          var c2 = this.coefs[2] / c3;
          var c1 = this.coefs[1] / c3;
          var c0 = this.coefs[0] / c3;
          var a = (3 * c1 - c2 * c2) / 3;
          var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
          var offset = c2 / 3;
          var discrim = b * b / 4 + a * a * a / 27;
          var halfB = b / 2;
          var ZEROepsilon = this.zeroErrorEstimate();

          if (Math.abs(discrim) <= ZEROepsilon) {
            discrim = 0;
          }

          if (discrim > 0) {
            var e = Math.sqrt(discrim);
            var root; // eslint-disable-line no-shadow

            var tmp = -halfB + e;

            if (tmp >= 0) {
              root = Math.pow(tmp, 1 / 3);
            } else {
              root = -Math.pow(-tmp, 1 / 3);
            }

            tmp = -halfB - e;

            if (tmp >= 0) {
              root += Math.pow(tmp, 1 / 3);
            } else {
              root -= Math.pow(-tmp, 1 / 3);
            }

            results.push(root - offset);
          } else if (discrim < 0) {
            var distance = Math.sqrt(-a / 3);
            var angle = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var sqrt3 = Math.sqrt(3);
            results.push(2 * distance * cos - offset);
            results.push(-distance * (cos + sqrt3 * sin) - offset);
            results.push(-distance * (cos - sqrt3 * sin) - offset);
          } else {
            var _tmp;

            if (halfB >= 0) {
              _tmp = -Math.pow(halfB, 1 / 3);
            } else {
              _tmp = Math.pow(-halfB, 1 / 3);
            }

            results.push(2 * _tmp - offset); // really should return next root twice, but we return only one

            results.push(-_tmp - offset);
          }
        }

        return results;
      }
      /**
       *  Calculates roots of quartic polynomial. <br/>
       *  First, derivative roots are found, then used to split quartic polynomial
       *  into segments, each containing one root of quartic polynomial.
       *  Segments are then passed to newton's method to find roots.
       *
       *  @returns {Array<number>} roots
       */

    }, {
      key: "getQuarticRoots",
      value: function getQuarticRoots() {
        var results = [];
        var n = this.getDegree();

        if (n === 4) {
          var poly = new Polynomial();
          poly.coefs = this.coefs.slice();
          poly.divideEqualsScalar(poly.coefs[n]);
          var ERRF = 1e-15;

          if (Math.abs(poly.coefs[0]) < 10 * ERRF * Math.abs(poly.coefs[3])) {
            poly.coefs[0] = 0;
          }

          var poly_d = poly.getDerivative();
          var derrt = poly_d.getRoots().sort(function (a, b) {
            return a - b;
          });
          var dery = [];
          var nr = derrt.length - 1;
          var rb = this.bounds();
          var maxabsX = Math.max(Math.abs(rb.minX), Math.abs(rb.maxX));
          var ZEROepsilon = this.zeroErrorEstimate(maxabsX);

          for (var _i3 = 0; _i3 <= nr; _i3++) {
            dery.push(poly.eval(derrt[_i3]));
          }

          for (var _i4 = 0; _i4 <= nr; _i4++) {
            if (Math.abs(dery[_i4]) < ZEROepsilon) {
              dery[_i4] = 0;
            }
          }

          var i = 0;
          var dx = Math.max(0.1 * (rb.maxX - rb.minX) / n, ERRF);
          var guesses = [];
          var minmax = [];

          if (nr > -1) {
            if (dery[0] !== 0) {
              if (sign(dery[0]) !== sign(poly.eval(derrt[0] - dx) - dery[0])) {
                guesses.push(derrt[0] - dx);
                minmax.push([rb.minX, derrt[0]]);
              }
            } else {
              results.push(derrt[0], derrt[0]);
              i++;
            }

            for (; i < nr; i++) {
              if (dery[i + 1] === 0) {
                results.push(derrt[i + 1], derrt[i + 1]);
                i++;
              } else if (sign(dery[i]) !== sign(dery[i + 1])) {
                guesses.push((derrt[i] + derrt[i + 1]) / 2);
                minmax.push([derrt[i], derrt[i + 1]]);
              }
            }

            if (dery[nr] !== 0 && sign(dery[nr]) !== sign(poly.eval(derrt[nr] + dx) - dery[nr])) {
              guesses.push(derrt[nr] + dx);
              minmax.push([derrt[nr], rb.maxX]);
            }
          }
          /**
           *  @param {number} x
           *  @returns {number}
           */


          var f = function f(x) {
            return poly.eval(x);
          };
          /**
           *  @param {number} x
           *  @returns {number}
           */


          var df = function df(x) {
            return poly_d.eval(x);
          };

          if (guesses.length > 0) {
            for (i = 0; i < guesses.length; i++) {
              guesses[i] = Polynomial.newtonSecantBisection(guesses[i], f, df, 32, minmax[i][0], minmax[i][1]);
            }
          }

          results = results.concat(guesses);
        }

        return results;
      }
    }], [{
      key: "interpolate",
      value: function interpolate(xs, ys, n, offset, x) {
        if (xs.constructor !== Array || ys.constructor !== Array) {
          throw new TypeError("xs and ys must be arrays");
        }

        if (isNaN(n) || isNaN(offset) || isNaN(x)) {
          throw new TypeError("n, offset, and x must be numbers");
        }

        var i, y;
        var dy = 0;
        var c = new Array(n);
        var d = new Array(n);
        var ns = 0;
        var diff = Math.abs(x - xs[offset]);

        for (i = 0; i < n; i++) {
          var dift = Math.abs(x - xs[offset + i]);

          if (dift < diff) {
            ns = i;
            diff = dift;
          }

          c[i] = d[i] = ys[offset + i];
        }

        y = ys[offset + ns];
        ns--;

        for (var m = 1; m < n; m++) {
          for (i = 0; i < n - m; i++) {
            var ho = xs[offset + i] - x;
            var hp = xs[offset + i + m] - x;
            var w = c[i + 1] - d[i];
            var den = ho - hp;

            if (den === 0.0) {
              throw new RangeError("Unable to interpolate polynomial. Two numbers in n were identical (to within roundoff)");
            }

            den = w / den;
            d[i] = hp * den;
            c[i] = ho * den;
          }

          dy = 2 * (ns + 1) < n - m ? c[ns + 1] : d[ns--];
          y += dy;
        }

        return {
          y: y,
          dy: dy
        };
      }
      /**
       *  Newton's (Newton-Raphson) method for finding Real roots on univariate function. <br/>
       *  When using bounds, algorithm falls back to secant if newton goes out of range.
       *  Bisection is fallback for secant when determined secant is not efficient enough.
       *  @see {@link http://en.wikipedia.org/wiki/Newton%27s_method}
       *  @see {@link http://en.wikipedia.org/wiki/Secant_method}
       *  @see {@link http://en.wikipedia.org/wiki/Bisection_method}
       *
       *  @param {number} x0 - Initial root guess
       *  @param {Function} f - Function which root we are trying to find
       *  @param {Function} df - Derivative of function f
       *  @param {number} max_iterations - Maximum number of algorithm iterations
       *  @param {number} [min] - Left bound value
       *  @param {number} [max] - Right bound value
       *  @returns {number} root
       */

    }, {
      key: "newtonSecantBisection",
      value: function newtonSecantBisection(x0, f, df, max_iterations, min, max) {
        var x,
            prev_dfx = 0,
            dfx,
            prev_x_ef_correction = 0,
            x_correction,
            x_new;
        var y, y_atmin, y_atmax;
        x = x0;
        var ACCURACY = 14;
        var min_correction_factor = Math.pow(10, -ACCURACY);
        var isBounded = typeof min === "number" && typeof max === "number";

        if (isBounded) {
          if (min > max) {
            throw new RangeError("Min must be greater than max");
          }

          y_atmin = f(min);
          y_atmax = f(max);

          if (sign(y_atmin) === sign(y_atmax)) {
            throw new RangeError("Y values of bounds must be of opposite sign");
          }
        }

        var isEnoughCorrection = function isEnoughCorrection() {
          // stop if correction is too small or if correction is in simple loop
          return Math.abs(x_correction) <= min_correction_factor * Math.abs(x) || prev_x_ef_correction === x - x_correction - x;
        };

        for (var i = 0; i < max_iterations; i++) {
          dfx = df(x);

          if (dfx === 0) {
            if (prev_dfx === 0) {
              // error
              throw new RangeError("df(x) is zero");
            } else {
              // use previous derivation value
              dfx = prev_dfx;
            } // or move x a little?
            // dfx = df(x != 0 ? x + x * 1e-15 : 1e-15);

          }

          prev_dfx = dfx;
          y = f(x);
          x_correction = y / dfx;
          x_new = x - x_correction;

          if (isEnoughCorrection()) {
            break;
          }

          if (isBounded) {
            if (sign(y) === sign(y_atmax)) {
              max = x;
              y_atmax = y;
            } else if (sign(y) === sign(y_atmin)) {
              min = x;
              y_atmin = y;
            } else {
              x = x_new;
              break;
            }

            if (x_new < min || x_new > max) {
              if (sign(y_atmin) === sign(y_atmax)) {
                break;
              }

              var RATIO_LIMIT = 50;
              var AIMED_BISECT_OFFSET = 0.25; // [0, 0.5)

              var dy = y_atmax - y_atmin;
              var dx = max - min;

              if (dy === 0) {
                x_correction = x - (min + dx * 0.5);
              } else if (Math.abs(dy / Math.min(y_atmin, y_atmax)) > RATIO_LIMIT) {
                x_correction = x - (min + dx * (0.5 + (Math.abs(y_atmin) < Math.abs(y_atmax) ? -AIMED_BISECT_OFFSET : AIMED_BISECT_OFFSET)));
              } else {
                x_correction = x - (min - y_atmin / dy * dx);
              }

              x_new = x - x_correction;

              if (isEnoughCorrection()) {
                break;
              }
            }
          }

          prev_x_ef_correction = x - x_new;
          x = x_new;
        }

        return x;
      }
    }]);

    return Polynomial;
  }();

  /**
   *  PathLexeme.js
   *
   *  @copyright 2002, 2013 Kevin Lindsey
   *  @module PathLexeme
   */

  /**
   *  PathLexeme
   */
  var PathLexeme = /*#__PURE__*/function () {
    /**
     *  PathLexeme
     *
     *  @param {number} type
     *  @param {string} text
     */
    function PathLexeme(type, text) {
      _classCallCheck(this, PathLexeme);

      this.type = type;
      this.text = text;
    }
    /**
     *  Determine if this lexeme is of the given type
     *
     *  @param {number} type
     *  @returns {boolean}
     */


    _createClass(PathLexeme, [{
      key: "typeis",
      value: function typeis(type) {
        return this.type === type;
      }
    }]);

    return PathLexeme;
  }();
  /*
   * token type enumerations
   */


  PathLexeme.UNDEFINED = 0;
  PathLexeme.COMMAND = 1;
  PathLexeme.NUMBER = 2;
  PathLexeme.EOD = 3;

  /**
   *  Create a new instance of PathLexer
   */

  var PathLexer = /*#__PURE__*/function () {
    /**
     *  @param {string} [pathData]
     */
    function PathLexer(pathData) {
      _classCallCheck(this, PathLexer);

      if (pathData === null || pathData === undefined) {
        pathData = "";
      }

      this.setPathData(pathData);
    }
    /**
     *  setPathData
     *
     *  @param {string} pathData
     */


    _createClass(PathLexer, [{
      key: "setPathData",
      value: function setPathData(pathData) {
        if (typeof pathData !== "string") {
          throw new TypeError("The first parameter must be a string");
        }

        this._pathData = pathData;
      }
      /**
       *  getNextToken
       *
       *  @returns {PathLexeme}
       */

    }, {
      key: "getNextToken",
      value: function getNextToken() {
        var result = null;
        var d = this._pathData;

        while (result === null) {
          if (d === null || d === "") {
            result = new PathLexeme(PathLexeme.EOD, "");
          } else if (d.match(/^([ \t\r\n,]+)/)) {
            d = d.substr(RegExp.$1.length);
          } else if (d.match(/^([AaCcHhLlMmQqSsTtVvZz])/)) {
            result = new PathLexeme(PathLexeme.COMMAND, RegExp.$1);
            d = d.substr(RegExp.$1.length);
          }
          /* eslint-disable-next-line unicorn/no-unsafe-regex */
          else if (d.match(/^(([-+]?\d+(\.\d*)?|[-+]?\.\d+)([eE][-+]?\d+)?)/)) {
              result = new PathLexeme(PathLexeme.NUMBER, RegExp.$1);
              d = d.substr(RegExp.$1.length);
            } else {
              throw new SyntaxError("Unrecognized path data: ".concat(d));
            }
        }

        this._pathData = d;
        return result;
      }
    }]);

    return PathLexer;
  }();

  var BOP = "BOP";
  /**
   *  PathParser
   */

  var PathParser = /*#__PURE__*/function () {
    /**
     * constructor
     */
    function PathParser() {
      _classCallCheck(this, PathParser);

      this._lexer = new PathLexer();
      this._handler = null;
    }
    /**
     *  parseData
     *
     *  @param {string} pathData
     *  @throws {Error}
     */


    _createClass(PathParser, [{
      key: "parseData",
      value: function parseData(pathData) {
        if (typeof pathData !== "string") {
          throw new TypeError("The first parameter must be a string: ".concat(pathData));
        } // begin parse


        if (this._handler !== null && typeof this._handler.beginParse === "function") {
          this._handler.beginParse();
        } // pass the pathData to the lexer


        var lexer = this._lexer;
        lexer.setPathData(pathData); // set mode to signify new path - Beginning Of Path

        var mode = BOP; // Process all tokens

        var lastToken = null;
        var token = lexer.getNextToken();

        while (token.typeis(PathLexeme.EOD) === false) {
          var parameterCount = void 0;
          var params = []; // process current token

          switch (token.type) {
            case PathLexeme.COMMAND:
              if (mode === BOP && token.text !== "M" && token.text !== "m") {
                throw new SyntaxError("New paths must begin with a moveto command. Found '".concat(token.text, "'"));
              } // Set new parsing mode


              mode = token.text; // Get count of numbers that must follow this command

              parameterCount = PathParser.PARAMCOUNT[token.text.toUpperCase()]; // Advance past command token

              token = lexer.getNextToken();
              break;

            case PathLexeme.NUMBER:
              // Most commands allow you to keep repeating parameters
              // without specifying the command again.  We just assume
              // that is the case and do nothing since the mode remains
              // the same
              if (mode === BOP) {
                throw new SyntaxError("New paths must begin with a moveto command. Found '".concat(token.text, "'"));
              } else {
                parameterCount = PathParser.PARAMCOUNT[mode.toUpperCase()];
              }

              break;

            default:
              throw new SyntaxError("Unrecognized command type: ".concat(token.type));
          } // Get parameters


          for (var i = 0; i < parameterCount; i++) {
            switch (token.type) {
              case PathLexeme.COMMAND:
                throw new SyntaxError("Parameter must be a number. Found '".concat(token.text, "'"));

              case PathLexeme.NUMBER:
                // convert current parameter to a float and add to
                // parameter list
                params[i] = parseFloat(token.text);
                break;

              case PathLexeme.EOD:
                throw new SyntaxError("Unexpected end of string");

              default:
                throw new SyntaxError("Unrecognized parameter type. Found type '".concat(token.type, "'"));
            }

            token = lexer.getNextToken();
          } // fire handler


          if (this._handler !== null) {
            var handler = this._handler;
            var methodName = PathParser.METHODNAME[mode]; // convert types for arcs

            if (mode === "a" || mode === "A") {
              params[3] = params[3] !== 0;
              params[4] = params[4] !== 0;
            }

            if (handler !== null && typeof handler[methodName] === "function") {
              handler[methodName].apply(handler, params);
            }
          } // Lineto's follow moveto when no command follows moveto params.  Go
          // ahead and set the mode just in case no command follows the moveto
          // command


          switch (mode) {
            case "M":
              mode = "L";
              break;

            case "m":
              mode = "l";
              break;

            case "Z":
            case "z":
              mode = "BOP";
              break;

          }

          if (token === lastToken) {
            throw new SyntaxError("Parser stalled on '".concat(token.text, "'"));
          } else {
            lastToken = token;
          }
        } // end parse


        if (this._handler !== null && typeof this._handler.endParse === "function") {
          this._handler.endParse();
        }
      }
      /**
       *  setHandler
       *
       *  @param {Object} handler
       */

    }, {
      key: "setHandler",
      value: function setHandler(handler) {
        this._handler = handler;
      }
    }]);

    return PathParser;
  }();
  /*
   * class constants
   */


  PathParser.PARAMCOUNT = {
    A: 7,
    C: 6,
    H: 1,
    L: 2,
    M: 2,
    Q: 4,
    S: 4,
    T: 2,
    V: 1,
    Z: 0
  };
  PathParser.METHODNAME = {
    A: "arcAbs",
    a: "arcRel",
    C: "curvetoCubicAbs",
    c: "curvetoCubicRel",
    H: "linetoHorizontalAbs",
    h: "linetoHorizontalRel",
    L: "linetoAbs",
    l: "linetoRel",
    M: "movetoAbs",
    m: "movetoRel",
    Q: "curvetoQuadraticAbs",
    q: "curvetoQuadraticRel",
    S: "curvetoCubicSmoothAbs",
    s: "curvetoCubicSmoothRel",
    T: "curvetoQuadraticSmoothAbs",
    t: "curvetoQuadraticSmoothRel",
    V: "linetoVerticalAbs",
    v: "linetoVerticalRel",
    Z: "closePath",
    z: "closePath"
  };

  var TWO_PI = 2.0 * Math.PI;
  /**
   * Based on the SVG 1.1 specification, Appendix F: Implementation Requirements,
   * Section F.6 "Elliptical arc implementation notes"
   * {@see https://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes}
   *
   * @param {module:kld-affine.Point2D} startPoint
   * @param {module:kld-affine.Point2D} endPoint
   * @param {number} rx
   * @param {number} ry
   * @param {number} angle
   * @param {boolean} arcFlag
   * @param {boolean} sweepFlag
   * @returns {Array}
   */

  function getArcParameters(startPoint, endPoint, rx, ry, angle, arcFlag, sweepFlag) {
    angle = angle * Math.PI / 180;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var TOLERANCE = 1e-6; // Section (F.6.5.1)

    var halfDiff = startPoint.subtract(endPoint).multiply(0.5);
    var x1p = halfDiff.x * c + halfDiff.y * s;
    var y1p = halfDiff.x * -s + halfDiff.y * c; // Section (F.6.6.1)

    rx = Math.abs(rx);
    ry = Math.abs(ry); // Section (F.6.6.2)

    var x1px1p = x1p * x1p;
    var y1py1p = y1p * y1p;
    var lambda = x1px1p / (rx * rx) + y1py1p / (ry * ry); // Section (F.6.6.3)

    if (lambda > 1) {
      var _factor = Math.sqrt(lambda);

      rx *= _factor;
      ry *= _factor;
    } // Section (F.6.5.2)


    var rxrx = rx * rx;
    var ryry = ry * ry;
    var rxy1 = rxrx * y1py1p;
    var ryx1 = ryry * x1px1p;
    var factor = (rxrx * ryry - rxy1 - ryx1) / (rxy1 + ryx1);

    if (Math.abs(factor) < TOLERANCE) {
      factor = 0;
    }

    var sq = Math.sqrt(factor);

    if (arcFlag === sweepFlag) {
      sq = -sq;
    } // Section (F.6.5.3)


    var mid = startPoint.add(endPoint).multiply(0.5);
    var cxp = sq * rx * y1p / ry;
    var cyp = sq * -ry * x1p / rx; // Section (F.6.5.5 - F.6.5.6)

    var xcr1 = (x1p - cxp) / rx;
    var xcr2 = (x1p + cxp) / rx;
    var ycr1 = (y1p - cyp) / ry;
    var ycr2 = (y1p + cyp) / ry;
    var theta1 = new Vector2D(1, 0).angleBetween(new Vector2D(xcr1, ycr1)); // let deltaTheta = normalizeAngle(new Vector2D(xcr1, ycr1).angleBetween(new Vector2D(-xcr2, -ycr2)));

    var deltaTheta = new Vector2D(xcr1, ycr1).angleBetween(new Vector2D(-xcr2, -ycr2));

    if (sweepFlag === false) {
      deltaTheta -= TWO_PI;
    }

    return [cxp * c - cyp * s + mid.x, cxp * s + cyp * c + mid.y, rx, ry, theta1, theta1 + deltaTheta];
  }
  /**
   *  PathHandler
   */


  var PathHandler = /*#__PURE__*/function () {
    /**
     * PathHandler
     *
     * @param {ShapeInfo} shapeCreator
     */
    function PathHandler(shapeCreator) {
      _classCallCheck(this, PathHandler);

      this.shapeCreator = shapeCreator;
      this.shapes = [];
      this.firstX = null;
      this.firstY = null;
      this.lastX = null;
      this.lastY = null;
      this.lastCommand = null;
    }
    /**
     * beginParse
     */


    _createClass(PathHandler, [{
      key: "beginParse",
      value: function beginParse() {
        // zero out the sub-path array
        this.shapes = []; // clear firstX, firstY, lastX, and lastY

        this.firstX = null;
        this.firstY = null;
        this.lastX = null;
        this.lastY = null; // need to remember last command type to determine how to handle the
        // relative Bezier commands

        this.lastCommand = null;
      }
      /**
       *  addShape
       *
       *  @param {ShapeInfo} shape
       */

    }, {
      key: "addShape",
      value: function addShape(shape) {
        this.shapes.push(shape);
      }
      /**
       *  arcAbs - A
       *
       *  @param {number} rx
       *  @param {number} ry
       *  @param {number} xAxisRotation
       *  @param {boolean} arcFlag
       *  @param {boolean} sweepFlag
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "arcAbs",
      value: function arcAbs(rx, ry, xAxisRotation, arcFlag, sweepFlag, x, y) {
        if (rx === 0 || ry === 0) {
          this.addShape(this.shapeCreator.line(this.lastX, this.lastY, x, y));
        } else {
          var _this$shapeCreator;

          var arcParameters = getArcParameters(new Point2D(this.lastX, this.lastY), new Point2D(x, y), rx, ry, xAxisRotation, arcFlag, sweepFlag);
          this.addShape((_this$shapeCreator = this.shapeCreator).arc.apply(_this$shapeCreator, _toConsumableArray(arcParameters)));
        }

        this.lastCommand = "A";
        this.lastX = x;
        this.lastY = y;
      }
      /**
       *  arcRel - a
       *
       *  @param {number} rx
       *  @param {number} ry
       *  @param {number} xAxisRotation
       *  @param {boolean} arcFlag
       *  @param {boolean} sweepFlag
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "arcRel",
      value: function arcRel(rx, ry, xAxisRotation, arcFlag, sweepFlag, x, y) {
        if (rx === 0 || ry === 0) {
          this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.lastX + x, this.lastY + y));
        } else {
          var _this$shapeCreator2;

          var arcParameters = getArcParameters(new Point2D(this.lastX, this.lastY), new Point2D(this.lastX + x, this.lastY + y), rx, ry, xAxisRotation, arcFlag, sweepFlag);
          this.addShape((_this$shapeCreator2 = this.shapeCreator).arc.apply(_this$shapeCreator2, _toConsumableArray(arcParameters)));
        }

        this.lastCommand = "a";
        this.lastX += x;
        this.lastY += y;
      }
      /**
       *  curvetoCubicAbs - C
       *
       *  @param {number} x1
       *  @param {number} y1
       *  @param {number} x2
       *  @param {number} y2
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoCubicAbs",
      value: function curvetoCubicAbs(x1, y1, x2, y2, x, y) {
        this.addShape(this.shapeCreator.cubicBezier(this.lastX, this.lastY, x1, y1, x2, y2, x, y));
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "C";
      }
      /**
       *  curvetoCubicRel - c
       *
       *  @param {number} x1
       *  @param {number} y1
       *  @param {number} x2
       *  @param {number} y2
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoCubicRel",
      value: function curvetoCubicRel(x1, y1, x2, y2, x, y) {
        this.addShape(this.shapeCreator.cubicBezier(this.lastX, this.lastY, this.lastX + x1, this.lastY + y1, this.lastX + x2, this.lastY + y2, this.lastX + x, this.lastY + y));
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "c";
      }
      /**
       *  linetoHorizontalAbs - H
       *
       *  @param {number} x
       */

    }, {
      key: "linetoHorizontalAbs",
      value: function linetoHorizontalAbs(x) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, x, this.lastY));
        this.lastX = x;
        this.lastCommand = "H";
      }
      /**
       *  linetoHorizontalRel - h
       *
       *  @param {number} x
       */

    }, {
      key: "linetoHorizontalRel",
      value: function linetoHorizontalRel(x) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.lastX + x, this.lastY));
        this.lastX += x;
        this.lastCommand = "h";
      }
      /**
       *  linetoAbs - L
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "linetoAbs",
      value: function linetoAbs(x, y) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, x, y));
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "L";
      }
      /**
       *  linetoRel - l
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "linetoRel",
      value: function linetoRel(x, y) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.lastX + x, this.lastY + y));
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "l";
      }
      /**
       *  movetoAbs - M
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "movetoAbs",
      value: function movetoAbs(x, y) {
        this.firstX = x;
        this.firstY = y;
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "M";
      }
      /**
       *  movetoRel - m
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "movetoRel",
      value: function movetoRel(x, y) {
        this.firstX += x;
        this.firstY += y;
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "m";
      }
      /**
       *  curvetoQuadraticAbs - Q
       *
       *  @param {number} x1
       *  @param {number} y1
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoQuadraticAbs",
      value: function curvetoQuadraticAbs(x1, y1, x, y) {
        this.addShape(this.shapeCreator.quadraticBezier(this.lastX, this.lastY, x1, y1, x, y));
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "Q";
      }
      /**
       *  curvetoQuadraticRel - q
       *
       *  @param {number} x1
       *  @param {number} y1
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoQuadraticRel",
      value: function curvetoQuadraticRel(x1, y1, x, y) {
        this.addShape(this.shapeCreator.quadraticBezier(this.lastX, this.lastY, this.lastX + x1, this.lastY + y1, this.lastX + x, this.lastY + y));
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "q";
      }
      /**
       *  curvetoCubicSmoothAbs - S
       *
       *  @param {number} x2
       *  @param {number} y2
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoCubicSmoothAbs",
      value: function curvetoCubicSmoothAbs(x2, y2, x, y) {
        var controlX, controlY;

        if (this.lastCommand.match(/^[SsCc]$/)) {
          var secondToLast = this.shapes[this.shapes.length - 1].args[2];
          controlX = 2 * this.lastX - secondToLast.x;
          controlY = 2 * this.lastY - secondToLast.y;
        } else {
          controlX = this.lastX;
          controlY = this.lastY;
        }

        this.addShape(this.shapeCreator.cubicBezier(this.lastX, this.lastY, controlX, controlY, x2, y2, x, y));
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "S";
      }
      /**
       *  curvetoCubicSmoothRel - s
       *
       *  @param {number} x2
       *  @param {number} y2
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoCubicSmoothRel",
      value: function curvetoCubicSmoothRel(x2, y2, x, y) {
        var controlX, controlY;

        if (this.lastCommand.match(/^[SsCc]$/)) {
          var secondToLast = this.shapes[this.shapes.length - 1].args[2];
          controlX = 2 * this.lastX - secondToLast.x;
          controlY = 2 * this.lastY - secondToLast.y;
        } else {
          controlX = this.lastX;
          controlY = this.lastY;
        }

        this.addShape(this.shapeCreator.cubicBezier(this.lastX, this.lastY, controlX, controlY, this.lastX + x2, this.lastY + y2, this.lastX + x, this.lastY + y));
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "s";
      }
      /**
       *  curvetoQuadraticSmoothAbs - T
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoQuadraticSmoothAbs",
      value: function curvetoQuadraticSmoothAbs(x, y) {
        var controlX, controlY;

        if (this.lastCommand.match(/^[QqTt]$/)) {
          var secondToLast = this.shapes[this.shapes.length - 1].args[1];
          controlX = 2 * this.lastX - secondToLast.x;
          controlY = 2 * this.lastY - secondToLast.y;
        } else {
          controlX = this.lastX;
          controlY = this.lastY;
        }

        this.addShape(this.shapeCreator.quadraticBezier(this.lastX, this.lastY, controlX, controlY, x, y));
        this.lastX = x;
        this.lastY = y;
        this.lastCommand = "T";
      }
      /**
       *  curvetoQuadraticSmoothRel - t
       *
       *  @param {number} x
       *  @param {number} y
       */

    }, {
      key: "curvetoQuadraticSmoothRel",
      value: function curvetoQuadraticSmoothRel(x, y) {
        var controlX, controlY;

        if (this.lastCommand.match(/^[QqTt]$/)) {
          var secondToLast = this.shapes[this.shapes.length - 1].args[1];
          controlX = 2 * this.lastX - secondToLast.x;
          controlY = 2 * this.lastY - secondToLast.y;
        } else {
          controlX = this.lastX;
          controlY = this.lastY;
        }

        this.addShape(this.shapeCreator.quadraticBezier(this.lastX, this.lastY, controlX, controlY, this.lastX + x, this.lastY + y));
        this.lastX += x;
        this.lastY += y;
        this.lastCommand = "t";
      }
      /**
       *  linetoVerticalAbs - V
       *
       *  @param {number} y
       */

    }, {
      key: "linetoVerticalAbs",
      value: function linetoVerticalAbs(y) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.lastX, y));
        this.lastY = y;
        this.lastCommand = "V";
      }
      /**
       *  linetoVerticalRel - v
       *
       *  @param {number} y
       */

    }, {
      key: "linetoVerticalRel",
      value: function linetoVerticalRel(y) {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.lastX, this.lastY + y));
        this.lastY += y;
        this.lastCommand = "v";
      }
      /**
       *  closePath - z or Z
       */

    }, {
      key: "closePath",
      value: function closePath() {
        this.addShape(this.shapeCreator.line(this.lastX, this.lastY, this.firstX, this.firstY));
        this.lastX = this.firstX;
        this.lastY = this.firstY;
        this.lastCommand = "z";
      }
    }]);

    return PathHandler;
  }();

  var degree90 = Math.PI * 0.5;
  var parser = new PathParser();
  /**
   * getValues
   *
   * @param {Array} types
   * @param {Array} args
   * @returns {Array}
   */

  function getValues(types, args) {
    var result = [];

    var _iterator = _createForOfIteratorHelper(types),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            names = _step$value[0],
            type = _step$value[1];

        var value = null;

        if (type === "Point2D") {
          value = parsePoint(names, args);
        } else if (type === "Number") {
          value = parseNumber(names, args);
        } else if (type === "Array<Point2D>" || type === "Point2D[]") {
          var values = [];

          while (args.length > 0) {
            values.push(parsePoint(names, args));
          }

          if (values.length > 0) {
            value = values;
          }
        } else if (type === "Optional<Number>" || type === "Number?") {
          value = parseNumber(names, args);

          if (value === null) {
            value = undefined;
          }
        } else {
          throw new TypeError("Unrecognized value type: ".concat(type));
        }

        if (value !== null) {
          result.push(value);
        } else {
          throw new TypeError("Unable to extract value for ".concat(names));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return result;
  }
  /**
   * parseNumber
   *
   * @param {Array} names
   * @param {Array} args
   * @returns {number}
   */

  function parseNumber(names, args) {
    var result = null;

    if (args.length > 0) {
      var item = args[0];

      var itemType = _typeof(item);

      if (itemType === "number") {
        return args.shift();
      } else if (itemType === "object") {
        var _iterator2 = _createForOfIteratorHelper(names),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var prop = _step2.value;

            if (prop in item && typeof item[prop] === "number") {
              result = item[prop];
              break;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }

    return result;
  }
  /**
   * parsePoint
   *
   * @param {Array} names
   * @param {Array} args
   * @returns {Array}
   */

  function parsePoint(names, args) {
    var result = null;

    if (args.length > 0) {
      (function () {
        var item = args[0];

        var itemType = _typeof(item);

        if (itemType === "number") {
          if (args.length > 1) {
            var x = args.shift();
            var y = args.shift();
            result = new Point2D(x, y);
          }
        } else if (Array.isArray(item) && item.length > 1) {
          if (item.length === 2) {
            var _args$shift = args.shift(),
                _args$shift2 = _slicedToArray(_args$shift, 2),
                _x = _args$shift2[0],
                _y = _args$shift2[1];

            result = new Point2D(_x, _y);
          } else {
            throw new TypeError("Unhandled array of length ".concat(item.length));
          }
        } else if (itemType === "object") {
          if ("x" in item && "y" in item) {
            result = new Point2D(item.x, item.y); // eslint-disable-next-line compat/compat

            if (Object.keys(item).length === 2) {
              args.shift();
            }
          } else {
            var _iterator3 = _createForOfIteratorHelper(names),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var props = _step3.value;

                if (Array.isArray(props)) {
                  if (props.every(function (p) {
                    return p in item;
                  })) {
                    result = new Point2D(item[props[0]], item[props[1]]);
                    break;
                  }
                } else if (props in item) {
                  result = parsePoint([], [item[props]]);
                  break;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }
        }
      })();
    }

    return result;
  }
  /**
   *  ShapeInfo
   *  @memberof module:kld-intersections
   */

  var ShapeInfo = /*#__PURE__*/function () {
    /**
     *  @param {string} name
     *  @param {Array} args
     *  @returns {module:kld-intersections.ShapeInfo}
     */
    function ShapeInfo(name, args) {
      _classCallCheck(this, ShapeInfo);

      this.name = name;
      this.args = args;
    }

    _createClass(ShapeInfo, null, [{
      key: "arc",
      value: function arc() {
        var types = [[["center", ["centerX", "centerY"], ["cx", "cy"]], "Point2D"], [["radiusX", "rx"], "Number"], [["radiusY", "ry"], "Number"], [["startRadians"], "Number"], [["endRadians"], "Number"]];

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.ARC, values);
      }
    }, {
      key: "quadraticBezier",
      value: function quadraticBezier() {
        var types = [[["p1", ["p1x", "p1y"]], "Point2D"], [["p2", ["p2x", "p2y"]], "Point2D"], [["p3", ["p3x", "p3y"]], "Point2D"]];

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.QUADRATIC_BEZIER, values);
      }
    }, {
      key: "cubicBezier",
      value: function cubicBezier() {
        var types = [[["p1", ["p1x", "p1y"]], "Point2D"], [["p2", ["p2x", "p2y"]], "Point2D"], [["p3", ["p3x", "p3y"]], "Point2D"], [["p4", ["p4x", "p4y"]], "Point2D"]];

        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.CUBIC_BEZIER, values);
      }
    }, {
      key: "circle",
      value: function circle() {
        var types = [[["center", ["centerX", "centerY"], ["cx", "cy"]], "Point2D"], [["radius", "r"], "Number"]];

        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.CIRCLE, values);
      }
    }, {
      key: "ellipse",
      value: function ellipse() {
        var types = [[["center", ["centerX", "centerY"], ["cx", "cy"]], "Point2D"], [["radiusX", "rx"], "Number"], [["radiusY", "ry"], "Number"]];

        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.ELLIPSE, values);
      }
    }, {
      key: "line",
      value: function line() {
        var types = [[["p1", ["p1x", "p1y"], ["x1", "y1"]], "Point2D"], [["p2", ["p2x", "p2y"], ["x2", "y2"]], "Point2D"]];

        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        var values = getValues(types, args);
        return new ShapeInfo(ShapeInfo.LINE, values);
      }
    }, {
      key: "path",
      value: function path() {
        parser.parseData(arguments.length <= 0 ? undefined : arguments[0]);
        return new ShapeInfo(ShapeInfo.PATH, handler.shapes);
      }
    }, {
      key: "polygon",
      value: function polygon() {
        var types = [[[], "Array<Point2D>"]];

        for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          args[_key7] = arguments[_key7];
        }

        var values = getValues(types, args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
        return new ShapeInfo(ShapeInfo.POLYGON, values);
      }
    }, {
      key: "polyline",
      value: function polyline() {
        var types = [[[], "Array<Point2D>"]];

        for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
          args[_key8] = arguments[_key8];
        }

        var values = getValues(types, args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
        return new ShapeInfo(ShapeInfo.POLYLINE, values);
      }
    }, {
      key: "rectangle",
      value: function rectangle() {
        var types = [[["topLeft", ["x", "y"], ["left", "top"]], "Point2D"], [["size", ["width", "height"], ["w", "h"]], "Point2D"], [["radiusX", "rx"], "Optional<Number>"], [["radiusY", "ry"], "Optional<Number>"]];

        for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
          args[_key9] = arguments[_key9];
        }

        var values = getValues(types, args); // fix up bottom-right point

        var p1 = values[0];
        var p2 = values[1];
        values[1] = new Point2D(p1.x + p2.x, p1.y + p2.y); // create shape info

        var result = new ShapeInfo(ShapeInfo.RECTANGLE, values); // handle possible rounded rectangle values

        var ry = result.args.pop();
        var rx = result.args.pop();
        rx = rx === undefined ? 0 : rx;
        ry = ry === undefined ? 0 : ry;

        if (rx === 0 && ry === 0) {
          return result;
        }

        var _result$args$ = result.args[0],
            p1x = _result$args$.x,
            p1y = _result$args$.y;
        var _result$args$2 = result.args[1],
            p2x = _result$args$2.x,
            p2y = _result$args$2.y;
        var width = p2x - p1x;
        var height = p2y - p1y;

        if (rx === 0) {
          rx = ry;
        }

        if (ry === 0) {
          ry = rx;
        }

        if (rx > width * 0.5) {
          rx = width * 0.5;
        }

        if (ry > height * 0.5) {
          ry = height * 0.5;
        }

        var x0 = p1x;
        var y0 = p1y;
        var x1 = p1x + rx;
        var y1 = p1y + ry;
        var x2 = p2x - rx;
        var y2 = p2y - ry;
        var x3 = p2x;
        var y3 = p2y;
        var segments = [ShapeInfo.arc(x1, y1, rx, ry, 2 * degree90, 3 * degree90), ShapeInfo.line(x1, y0, x2, y0), ShapeInfo.arc(x2, y1, rx, ry, 3 * degree90, 4 * degree90), ShapeInfo.line(x3, y1, x3, y2), ShapeInfo.arc(x2, y2, rx, ry, 0, degree90), ShapeInfo.line(x2, y3, x1, y3), ShapeInfo.arc(x1, y2, rx, ry, degree90, 2 * degree90), ShapeInfo.line(x0, y2, x0, y1)];
        return new ShapeInfo(ShapeInfo.PATH, segments);
      }
    }]);

    return ShapeInfo;
  }(); // define shape name constants
  ShapeInfo.ARC = "Arc";
  ShapeInfo.QUADRATIC_BEZIER = "Bezier2";
  ShapeInfo.CUBIC_BEZIER = "Bezier3";
  ShapeInfo.CIRCLE = "Circle";
  ShapeInfo.ELLIPSE = "Ellipse";
  ShapeInfo.LINE = "Line";
  ShapeInfo.PATH = "Path";
  ShapeInfo.POLYGON = "Polygon";
  ShapeInfo.POLYLINE = "Polyline";
  ShapeInfo.RECTANGLE = "Rectangle"; // setup path parser handler after ShapeInfo has been defined

  var handler = new PathHandler(ShapeInfo);
  parser.setHandler(handler);

  var TWO_PI$1 = 2.0 * Math.PI;
  var UNIT_X = new Vector2D(1, 0);
  /**
   * @memberof module:kld-intersections.Intersection
   * @param {*} o
   * @returns {boolean}
   */

  function isNullish(o) {
    return o === null || o === undefined;
  }
  /**
   *  bezout
   *
   *  This code is based on MgcIntr2DElpElp.cpp written by David Eberly.  His
   *  code along with many other excellent examples are avaiable at his site:
   *  http://www.magic-software.com
   *
   *  @param {Array<module:kld-intersections.Point2D>} e1
   *  @param {Array<module:kld-intersections.Point2D>} e2
   *  @returns {external:Polynomial}
   */


  function bezout(e1, e2) {
    var AB = e1[0] * e2[1] - e2[0] * e1[1];
    var AC = e1[0] * e2[2] - e2[0] * e1[2];
    var AD = e1[0] * e2[3] - e2[0] * e1[3];
    var AE = e1[0] * e2[4] - e2[0] * e1[4];
    var AF = e1[0] * e2[5] - e2[0] * e1[5];
    var BC = e1[1] * e2[2] - e2[1] * e1[2];
    var BE = e1[1] * e2[4] - e2[1] * e1[4];
    var BF = e1[1] * e2[5] - e2[1] * e1[5];
    var CD = e1[2] * e2[3] - e2[2] * e1[3];
    var DE = e1[3] * e2[4] - e2[3] * e1[4];
    var DF = e1[3] * e2[5] - e2[3] * e1[5];
    var BFpDE = BF + DE;
    var BEmCD = BE - CD;
    return new Polynomial(AB * BC - AC * AC, AB * BEmCD + AD * BC - 2 * AC * AE, AB * BFpDE + AD * BEmCD - AE * AE - 2 * AC * AF, AB * DF + AD * BFpDE - 2 * AE * AF, AD * DF - AF * AF);
  }
  /**
   * normalizeAngle
   *
   * @param {number} radians
   * @returns {number}
   */


  function normalizeAngle(radians) {
    var normal = radians % TWO_PI$1;
    return normal < 0.0 ? normal + TWO_PI$1 : normal;
  }
  /**
   * restrictPointsToArc
   *
   * @param {module:kld-intersections.Intersection} intersections
   * @param {module:kld-intersections.Point2D} center
   * @param {number} radiusX
   * @param {number} radiusY
   * @param {number} startRadians
   * @param {number} endRadians
   * @returns {module:kld-intersections.Intersection}
   */


  function restrictPointsToArc(intersections, center, radiusX, radiusY, startRadians, endRadians) {
    if (intersections.points.length === 0) {
      return intersections;
    }

    var result = new Intersection("No Intersection"); // swap if end is lower, so start is always the lower one

    if (endRadians < startRadians) {
      var _ref = [endRadians, startRadians];
      startRadians = _ref[0];
      endRadians = _ref[1];
    } // move everything to the positive domain, simultaneously


    if (startRadians < 0 || endRadians < 0) {
      startRadians += TWO_PI$1;
      endRadians += TWO_PI$1;
    }

    var _iterator = _createForOfIteratorHelper(intersections.points),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var p = _step.value;
        var a = normalizeAngle(UNIT_X.angleBetween(Vector2D.fromPoints(center, p))); // a angle smaller than start, it may still be between
        // this happens if end > TWO_PI

        if (a < startRadians) {
          a += TWO_PI$1;
        }

        if (startRadians <= a && a <= endRadians) {
          result.appendPoint(p);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (result.points.length > 0) {
      result.status = "Intersection";
    }

    return result;
  }
  /**
   *  closePolygon
   *  @memberof module:kld-intersections.Intersection
   *  @param {Array<module:kld-intersections.Point2D>} points
   *  @returns {Array<module:kld-intersections.Point2D>}
   */


  function closePolygon(points) {
    var copy = points.slice();
    copy.push(points[0]);
    return copy;
  }
  /**
   * Intersection
   * @memberof module:kld-intersections
   */


  var Intersection = /*#__PURE__*/function () {
    /**
     *  @param {string} status
     *  @returns {module:kld-intersections.Intersection}
     */
    function Intersection(status) {
      _classCallCheck(this, Intersection);

      this.init(status);
    }
    /**
     *  init
     *
     *  @param {string} status
     *  @returns {module:kld-intersections.Intersection}
     */


    _createClass(Intersection, [{
      key: "init",
      value: function init(status) {
        this.status = status;
        this.points = [];
      }
      /**
       *  intersect
       *
       *  @param {module:kld-intersections.ShapeInfo} shape1
       *  @param {module:kld-intersections.ShapeInfo} shape2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "appendPoint",

      /**
       *  appendPoint
       *
       *  @param {module:kld-intersections.Point2D} point
       */
      value: function appendPoint(point) {
        this.points.push(point);
      }
      /**
       *  appendPoints
       *
       *  @param {Array<module:kld-intersections.Point2D>} points
       */

    }, {
      key: "appendPoints",
      value: function appendPoints(points) {
        this.points = this.points.concat(points);
      }
    }], [{
      key: "intersect",
      value: function intersect(shape1, shape2) {
        var result;

        if (!isNullish(shape1) && !isNullish(shape2)) {
          if (shape1.name === "Path") {
            result = Intersection.intersectPathShape(shape1, shape2);
          } else if (shape2.name === "Path") {
            result = Intersection.intersectPathShape(shape2, shape1);
          } else if (shape1.name === "Arc") {
            result = Intersection.intersectArcShape(shape1, shape2);
          } else if (shape2.name === "Arc") {
            result = Intersection.intersectArcShape(shape2, shape1);
          } else {
            var method;
            var args;

            if (shape1.name < shape2.name) {
              method = "intersect" + shape1.name + shape2.name;
              args = shape1.args.concat(shape2.args);
            } else {
              method = "intersect" + shape2.name + shape1.name;
              args = shape2.args.concat(shape1.args);
            }

            if (!(method in Intersection)) {
              throw new TypeError("Intersection not available: " + method);
            }

            result = Intersection[method].apply(null, args);
          }
        } else {
          result = new Intersection("No Intersection");
        }

        return result;
      }
      /**
       *  intersectPathShape
       *
       *  @param {module:kld-intersections.ShapeInfo} path
       *  @param {module:kld-intersections.ShapeInfo} shape
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPathShape",
      value: function intersectPathShape(path, shape) {
        var result = new Intersection("No Intersection");

        var _iterator2 = _createForOfIteratorHelper(path.args),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var segment = _step2.value;
            var inter = Intersection.intersect(segment, shape);
            result.appendPoints(inter.points);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       * intersectArcShape
       *
       * @param {module:kld-intersections.ShapeInfo} arc
       * @param {module:kld-intersections.ShapeInfo} shape
       * @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectArcShape",
      value: function intersectArcShape(arc, shape) {
        var _arc$args = _slicedToArray(arc.args, 5),
            center = _arc$args[0],
            radiusX = _arc$args[1],
            radiusY = _arc$args[2],
            startRadians = _arc$args[3],
            endRadians = _arc$args[4];

        var ellipse = new ShapeInfo(ShapeInfo.ELLIPSE, [center, radiusX, radiusY]);
        var ellipse_result = Intersection.intersect(ellipse, shape); // return ellipse_result;

        return restrictPointsToArc(ellipse_result, center, radiusX, radiusY, startRadians, endRadians);
      }
      /**
       *  intersectBezier2Bezier2
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} a3
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @param {module:kld-intersections.Point2D} b3
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Bezier2",
      value: function intersectBezier2Bezier2(a1, a2, a3, b1, b2, b3) {
        var a, b;
        var result = new Intersection("No Intersection");
        a = a2.multiply(-2);
        var c12 = a1.add(a.add(a3));
        a = a1.multiply(-2);
        b = a2.multiply(2);
        var c11 = a.add(b);
        var c10 = new Point2D(a1.x, a1.y);
        a = b2.multiply(-2);
        var c22 = b1.add(a.add(b3));
        a = b1.multiply(-2);
        b = b2.multiply(2);
        var c21 = a.add(b);
        var c20 = new Point2D(b1.x, b1.y); // bezout

        a = c12.x * c11.y - c11.x * c12.y;
        b = c22.x * c11.y - c11.x * c22.y;
        var c = c21.x * c11.y - c11.x * c21.y;
        var d = c11.x * (c10.y - c20.y) + c11.y * (-c10.x + c20.x);
        var e = c22.x * c12.y - c12.x * c22.y;
        var f = c21.x * c12.y - c12.x * c21.y;
        var g = c12.x * (c10.y - c20.y) + c12.y * (-c10.x + c20.x); // determinant

        var poly = new Polynomial(-e * e, -2 * e * f, a * b - f * f - 2 * e * g, a * c - 2 * f * g, a * d - g * g);
        var roots = poly.getRoots();

        var _iterator3 = _createForOfIteratorHelper(roots),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var s = _step3.value;

            if (0 <= s && s <= 1) {
              var xp = new Polynomial(c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x);
              xp.simplifyEquals();
              var xRoots = xp.getRoots();
              var yp = new Polynomial(c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y);
              yp.simplifyEquals();
              var yRoots = yp.getRoots();

              if (xRoots.length > 0 && yRoots.length > 0) {
                var TOLERANCE = 1e-4;

                var _iterator4 = _createForOfIteratorHelper(xRoots),
                    _step4;

                try {
                  checkRoots: for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var xRoot = _step4.value;

                    if (0 <= xRoot && xRoot <= 1) {
                      for (var k = 0; k < yRoots.length; k++) {
                        if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                          result.points.push(c22.multiply(s * s).add(c21.multiply(s).add(c20)));
                          break checkRoots;
                        }
                      }
                    }
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier2Bezier3
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} a3
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @param {module:kld-intersections.Point2D} b3
       *  @param {module:kld-intersections.Point2D} b4
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Bezier3",
      value: function intersectBezier2Bezier3(a1, a2, a3, b1, b2, b3, b4) {
        var a, b, c, d;
        var result = new Intersection("No Intersection");
        a = a2.multiply(-2);
        var c12 = a1.add(a.add(a3));
        a = a1.multiply(-2);
        b = a2.multiply(2);
        var c11 = a.add(b);
        var c10 = new Point2D(a1.x, a1.y);
        a = b1.multiply(-1);
        b = b2.multiply(3);
        c = b3.multiply(-3);
        d = a.add(b.add(c.add(b4)));
        var c23 = new Point2D(d.x, d.y);
        a = b1.multiply(3);
        b = b2.multiply(-6);
        c = b3.multiply(3);
        d = a.add(b.add(c));
        var c22 = new Point2D(d.x, d.y);
        a = b1.multiply(-3);
        b = b2.multiply(3);
        c = a.add(b);
        var c21 = new Point2D(c.x, c.y);
        var c20 = new Point2D(b1.x, b1.y);
        var c10x2 = c10.x * c10.x;
        var c10y2 = c10.y * c10.y;
        var c11x2 = c11.x * c11.x;
        var c11y2 = c11.y * c11.y;
        var c12x2 = c12.x * c12.x;
        var c12y2 = c12.y * c12.y;
        var c20x2 = c20.x * c20.x;
        var c20y2 = c20.y * c20.y;
        var c21x2 = c21.x * c21.x;
        var c21y2 = c21.y * c21.y;
        var c22x2 = c22.x * c22.x;
        var c22y2 = c22.y * c22.y;
        var c23x2 = c23.x * c23.x;
        var c23y2 = c23.y * c23.y;
        var poly = new Polynomial(-2 * c12.x * c12.y * c23.x * c23.y + c12x2 * c23y2 + c12y2 * c23x2, -2 * c12.x * c12.y * c22.x * c23.y - 2 * c12.x * c12.y * c22.y * c23.x + 2 * c12y2 * c22.x * c23.x + 2 * c12x2 * c22.y * c23.y, -2 * c12.x * c21.x * c12.y * c23.y - 2 * c12.x * c12.y * c21.y * c23.x - 2 * c12.x * c12.y * c22.x * c22.y + 2 * c21.x * c12y2 * c23.x + c12y2 * c22x2 + c12x2 * (2 * c21.y * c23.y + c22y2), 2 * c10.x * c12.x * c12.y * c23.y + 2 * c10.y * c12.x * c12.y * c23.x + c11.x * c11.y * c12.x * c23.y + c11.x * c11.y * c12.y * c23.x - 2 * c20.x * c12.x * c12.y * c23.y - 2 * c12.x * c20.y * c12.y * c23.x - 2 * c12.x * c21.x * c12.y * c22.y - 2 * c12.x * c12.y * c21.y * c22.x - 2 * c10.x * c12y2 * c23.x - 2 * c10.y * c12x2 * c23.y + 2 * c20.x * c12y2 * c23.x + 2 * c21.x * c12y2 * c22.x - c11y2 * c12.x * c23.x - c11x2 * c12.y * c23.y + c12x2 * (2 * c20.y * c23.y + 2 * c21.y * c22.y), 2 * c10.x * c12.x * c12.y * c22.y + 2 * c10.y * c12.x * c12.y * c22.x + c11.x * c11.y * c12.x * c22.y + c11.x * c11.y * c12.y * c22.x - 2 * c20.x * c12.x * c12.y * c22.y - 2 * c12.x * c20.y * c12.y * c22.x - 2 * c12.x * c21.x * c12.y * c21.y - 2 * c10.x * c12y2 * c22.x - 2 * c10.y * c12x2 * c22.y + 2 * c20.x * c12y2 * c22.x - c11y2 * c12.x * c22.x - c11x2 * c12.y * c22.y + c21x2 * c12y2 + c12x2 * (2 * c20.y * c22.y + c21y2), 2 * c10.x * c12.x * c12.y * c21.y + 2 * c10.y * c12.x * c21.x * c12.y + c11.x * c11.y * c12.x * c21.y + c11.x * c11.y * c21.x * c12.y - 2 * c20.x * c12.x * c12.y * c21.y - 2 * c12.x * c20.y * c21.x * c12.y - 2 * c10.x * c21.x * c12y2 - 2 * c10.y * c12x2 * c21.y + 2 * c20.x * c21.x * c12y2 - c11y2 * c12.x * c21.x - c11x2 * c12.y * c21.y + 2 * c12x2 * c20.y * c21.y, -2 * c10.x * c10.y * c12.x * c12.y - c10.x * c11.x * c11.y * c12.y - c10.y * c11.x * c11.y * c12.x + 2 * c10.x * c12.x * c20.y * c12.y + 2 * c10.y * c20.x * c12.x * c12.y + c11.x * c20.x * c11.y * c12.y + c11.x * c11.y * c12.x * c20.y - 2 * c20.x * c12.x * c20.y * c12.y - 2 * c10.x * c20.x * c12y2 + c10.x * c11y2 * c12.x + c10.y * c11x2 * c12.y - 2 * c10.y * c12x2 * c20.y - c20.x * c11y2 * c12.x - c11x2 * c20.y * c12.y + c10x2 * c12y2 + c10y2 * c12x2 + c20x2 * c12y2 + c12x2 * c20y2);
        var roots = poly.getRootsInInterval(0, 1);

        var _iterator5 = _createForOfIteratorHelper(roots),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var s = _step5.value;
            var xRoots = new Polynomial(c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x).getRoots();
            var yRoots = new Polynomial(c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y).getRoots();

            if (xRoots.length > 0 && yRoots.length > 0) {
              var TOLERANCE = 1e-4;

              var _iterator6 = _createForOfIteratorHelper(xRoots),
                  _step6;

              try {
                checkRoots: for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var xRoot = _step6.value;

                  if (0 <= xRoot && xRoot <= 1) {
                    for (var k = 0; k < yRoots.length; k++) {
                      if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                        result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                        break checkRoots;
                      }
                    }
                  }
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier2Circle
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Circle",
      value: function intersectBezier2Circle(p1, p2, p3, c, r) {
        return Intersection.intersectBezier2Ellipse(p1, p2, p3, c, r, r);
      }
      /**
       *  intersectBezier2Ellipse
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} ec
       *  @param {number} rx
       *  @param {number} ry
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Ellipse",
      value: function intersectBezier2Ellipse(p1, p2, p3, ec, rx, ry) {
        var a; // temporary variables
        // c2, c1, c0; // coefficients of quadratic

        var result = new Intersection("No Intersection");
        a = p2.multiply(-2);
        var c2 = p1.add(a.add(p3));
        a = p1.multiply(-2);
        var b = p2.multiply(2);
        var c1 = a.add(b);
        var c0 = new Point2D(p1.x, p1.y);
        var rxrx = rx * rx;
        var ryry = ry * ry;
        var roots = new Polynomial(ryry * c2.x * c2.x + rxrx * c2.y * c2.y, 2 * (ryry * c2.x * c1.x + rxrx * c2.y * c1.y), ryry * (2 * c2.x * c0.x + c1.x * c1.x) + rxrx * (2 * c2.y * c0.y + c1.y * c1.y) - 2 * (ryry * ec.x * c2.x + rxrx * ec.y * c2.y), 2 * (ryry * c1.x * (c0.x - ec.x) + rxrx * c1.y * (c0.y - ec.y)), ryry * (c0.x * c0.x + ec.x * ec.x) + rxrx * (c0.y * c0.y + ec.y * ec.y) - 2 * (ryry * ec.x * c0.x + rxrx * ec.y * c0.y) - rxrx * ryry).getRoots();

        var _iterator7 = _createForOfIteratorHelper(roots),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var t = _step7.value;

            if (0 <= t && t <= 1) {
              result.points.push(c2.multiply(t * t).add(c1.multiply(t).add(c0)));
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier2Line
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Line",
      value: function intersectBezier2Line(p1, p2, p3, a1, a2) {
        var a; // temporary variables
        // let c2, c1, c0; // coefficients of quadratic
        // cl; // c coefficient for normal form of line
        // n; // normal for normal form of line

        var min = a1.min(a2); // used to determine if point is on line segment

        var max = a1.max(a2); // used to determine if point is on line segment

        var result = new Intersection("No Intersection");
        a = p2.multiply(-2);
        var c2 = p1.add(a.add(p3));
        a = p1.multiply(-2);
        var b = p2.multiply(2);
        var c1 = a.add(b);
        var c0 = new Point2D(p1.x, p1.y); // Convert line to normal form: ax + by + c = 0
        // Find normal to line: negative inverse of original line's slope

        var n = new Vector2D(a1.y - a2.y, a2.x - a1.x); // Determine new c coefficient

        var cl = a1.x * a2.y - a2.x * a1.y; // Transform cubic coefficients to line's coordinate system and find roots
        // of cubic

        var roots = new Polynomial(n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots(); // Any roots in closed interval [0,1] are intersections on Bezier, but
        // might not be on the line segment.
        // Find intersections and calculate point coordinates

        var _iterator8 = _createForOfIteratorHelper(roots),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var t = _step8.value;

            if (0 <= t && t <= 1) {
              // We're within the Bezier curve
              // Find point on Bezier
              var p4 = p1.lerp(p2, t);
              var p5 = p2.lerp(p3, t);
              var p6 = p4.lerp(p5, t); // See if point is on line segment
              // Had to make special cases for vertical and horizontal lines due
              // to slight errors in calculation of p6

              if (a1.x === a2.x) {
                if (min.y <= p6.y && p6.y <= max.y) {
                  result.status = "Intersection";
                  result.appendPoint(p6);
                }
              } else if (a1.y === a2.y) {
                if (min.x <= p6.x && p6.x <= max.x) {
                  result.status = "Intersection";
                  result.appendPoint(p6);
                }
              } else if (min.x <= p6.x && p6.x <= max.x && min.y <= p6.y && p6.y <= max.y) {
                result.status = "Intersection";
                result.appendPoint(p6);
              }
            }
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }

        return result;
      }
      /**
       *  intersectBezier2Polygon
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Polygon",
      value: function intersectBezier2Polygon(p1, p2, p3, points) {
        return Intersection.intersectBezier2Polyline(p1, p2, p3, closePolygon(points));
      }
      /**
       *  intersectBezier2Polyline
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Polyline",
      value: function intersectBezier2Polyline(p1, p2, p3, points) {
        var result = new Intersection("No Intersection");
        var len = points.length;

        for (var i = 0; i < len - 1; i++) {
          var a1 = points[i];
          var a2 = points[i + 1];
          var inter = Intersection.intersectBezier2Line(p1, p2, p3, a1, a2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier2Rectangle
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier2Rectangle",
      value: function intersectBezier2Rectangle(p1, p2, p3, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectBezier2Line(p1, p2, p3, min, topRight);
        var inter2 = Intersection.intersectBezier2Line(p1, p2, p3, topRight, max);
        var inter3 = Intersection.intersectBezier2Line(p1, p2, p3, max, bottomLeft);
        var inter4 = Intersection.intersectBezier2Line(p1, p2, p3, bottomLeft, min);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier3Bezier3
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} a3
       *  @param {module:kld-intersections.Point2D} a4
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @param {module:kld-intersections.Point2D} b3
       *  @param {module:kld-intersections.Point2D} b4
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Bezier3",
      value: function intersectBezier3Bezier3(a1, a2, a3, a4, b1, b2, b3, b4) {
        var a, b, c, d; // temporary variables
        // c13, c12, c11, c10; // coefficients of cubic
        // c23, c22, c21, c20; // coefficients of cubic

        var result = new Intersection("No Intersection"); // Calculate the coefficients of cubic polynomial

        a = a1.multiply(-1);
        b = a2.multiply(3);
        c = a3.multiply(-3);
        d = a.add(b.add(c.add(a4)));
        var c13 = new Point2D(d.x, d.y);
        a = a1.multiply(3);
        b = a2.multiply(-6);
        c = a3.multiply(3);
        d = a.add(b.add(c));
        var c12 = new Point2D(d.x, d.y);
        a = a1.multiply(-3);
        b = a2.multiply(3);
        c = a.add(b);
        var c11 = new Point2D(c.x, c.y);
        var c10 = new Point2D(a1.x, a1.y);
        a = b1.multiply(-1);
        b = b2.multiply(3);
        c = b3.multiply(-3);
        d = a.add(b.add(c.add(b4)));
        var c23 = new Point2D(d.x, d.y);
        a = b1.multiply(3);
        b = b2.multiply(-6);
        c = b3.multiply(3);
        d = a.add(b.add(c));
        var c22 = new Point2D(d.x, d.y);
        a = b1.multiply(-3);
        b = b2.multiply(3);
        c = a.add(b);
        var c21 = new Point2D(c.x, c.y);
        var c20 = new Point2D(b1.x, b1.y); // bezout

        a = c13.x * c12.y - c12.x * c13.y;
        b = c13.x * c11.y - c11.x * c13.y;
        var c0 = c13.x * c10.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        var c1 = c21.x * c13.y - c13.x * c21.y;
        var c2 = c22.x * c13.y - c13.x * c22.y;
        var c3 = c23.x * c13.y - c13.x * c23.y;
        d = c13.x * c11.y - c11.x * c13.y;
        var e0 = c13.x * c10.y + c12.x * c11.y - c11.x * c12.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        var e1 = c21.x * c13.y - c13.x * c21.y;
        var e2 = c22.x * c13.y - c13.x * c22.y;
        var e3 = c23.x * c13.y - c13.x * c23.y;
        var f0 = c12.x * c10.y - c10.x * c12.y + c20.x * c12.y - c12.x * c20.y;
        var f1 = c21.x * c12.y - c12.x * c21.y;
        var f2 = c22.x * c12.y - c12.x * c22.y;
        var f3 = c23.x * c12.y - c12.x * c23.y;
        var g0 = c13.x * c10.y - c10.x * c13.y + c20.x * c13.y - c13.x * c20.y;
        var g1 = c21.x * c13.y - c13.x * c21.y;
        var g2 = c22.x * c13.y - c13.x * c22.y;
        var g3 = c23.x * c13.y - c13.x * c23.y;
        var h0 = c12.x * c10.y - c10.x * c12.y + c20.x * c12.y - c12.x * c20.y;
        var h1 = c21.x * c12.y - c12.x * c21.y;
        var h2 = c22.x * c12.y - c12.x * c22.y;
        var h3 = c23.x * c12.y - c12.x * c23.y;
        var i0 = c11.x * c10.y - c10.x * c11.y + c20.x * c11.y - c11.x * c20.y;
        var i1 = c21.x * c11.y - c11.x * c21.y;
        var i2 = c22.x * c11.y - c11.x * c22.y;
        var i3 = c23.x * c11.y - c11.x * c23.y; // determinant

        var poly = new Polynomial(-c3 * e3 * g3, -c3 * e3 * g2 - c3 * e2 * g3 - c2 * e3 * g3, -c3 * e3 * g1 - c3 * e2 * g2 - c2 * e3 * g2 - c3 * e1 * g3 - c2 * e2 * g3 - c1 * e3 * g3, -c3 * e3 * g0 - c3 * e2 * g1 - c2 * e3 * g1 - c3 * e1 * g2 - c2 * e2 * g2 - c1 * e3 * g2 - c3 * e0 * g3 - c2 * e1 * g3 - c1 * e2 * g3 - c0 * e3 * g3 + b * f3 * g3 + c3 * d * h3 - a * f3 * h3 + a * e3 * i3, -c3 * e2 * g0 - c2 * e3 * g0 - c3 * e1 * g1 - c2 * e2 * g1 - c1 * e3 * g1 - c3 * e0 * g2 - c2 * e1 * g2 - c1 * e2 * g2 - c0 * e3 * g2 + b * f3 * g2 - c2 * e0 * g3 - c1 * e1 * g3 - c0 * e2 * g3 + b * f2 * g3 + c3 * d * h2 - a * f3 * h2 + c2 * d * h3 - a * f2 * h3 + a * e3 * i2 + a * e2 * i3, -c3 * e1 * g0 - c2 * e2 * g0 - c1 * e3 * g0 - c3 * e0 * g1 - c2 * e1 * g1 - c1 * e2 * g1 - c0 * e3 * g1 + b * f3 * g1 - c2 * e0 * g2 - c1 * e1 * g2 - c0 * e2 * g2 + b * f2 * g2 - c1 * e0 * g3 - c0 * e1 * g3 + b * f1 * g3 + c3 * d * h1 - a * f3 * h1 + c2 * d * h2 - a * f2 * h2 + c1 * d * h3 - a * f1 * h3 + a * e3 * i1 + a * e2 * i2 + a * e1 * i3, -c3 * e0 * g0 - c2 * e1 * g0 - c1 * e2 * g0 - c0 * e3 * g0 + b * f3 * g0 - c2 * e0 * g1 - c1 * e1 * g1 - c0 * e2 * g1 + b * f2 * g1 - c1 * e0 * g2 - c0 * e1 * g2 + b * f1 * g2 - c0 * e0 * g3 + b * f0 * g3 + c3 * d * h0 - a * f3 * h0 + c2 * d * h1 - a * f2 * h1 + c1 * d * h2 - a * f1 * h2 + c0 * d * h3 - a * f0 * h3 + a * e3 * i0 + a * e2 * i1 + a * e1 * i2 - b * d * i3 + a * e0 * i3, -c2 * e0 * g0 - c1 * e1 * g0 - c0 * e2 * g0 + b * f2 * g0 - c1 * e0 * g1 - c0 * e1 * g1 + b * f1 * g1 - c0 * e0 * g2 + b * f0 * g2 + c2 * d * h0 - a * f2 * h0 + c1 * d * h1 - a * f1 * h1 + c0 * d * h2 - a * f0 * h2 + a * e2 * i0 + a * e1 * i1 - b * d * i2 + a * e0 * i2, -c1 * e0 * g0 - c0 * e1 * g0 + b * f1 * g0 - c0 * e0 * g1 + b * f0 * g1 + c1 * d * h0 - a * f1 * h0 + c0 * d * h1 - a * f0 * h1 + a * e1 * i0 - b * d * i1 + a * e0 * i1, -c0 * e0 * g0 + b * f0 * g0 + c0 * d * h0 - a * f0 * h0 - b * d * i0 + a * e0 * i0);
        poly.simplifyEquals();
        var roots = poly.getRootsInInterval(0, 1);

        var _iterator9 = _createForOfIteratorHelper(roots),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var s = _step9.value;
            var xp = new Polynomial(c13.x, c12.x, c11.x, c10.x - c20.x - s * c21.x - s * s * c22.x - s * s * s * c23.x);
            xp.simplifyEquals();
            var xRoots = xp.getRoots();
            var yp = new Polynomial(c13.y, c12.y, c11.y, c10.y - c20.y - s * c21.y - s * s * c22.y - s * s * s * c23.y);
            yp.simplifyEquals();
            var yRoots = yp.getRoots();

            if (xRoots.length > 0 && yRoots.length > 0) {
              var TOLERANCE = 1e-4;

              var _iterator10 = _createForOfIteratorHelper(xRoots),
                  _step10;

              try {
                checkRoots: for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                  var xRoot = _step10.value;

                  if (0 <= xRoot && xRoot <= 1) {
                    for (var k = 0; k < yRoots.length; k++) {
                      if (Math.abs(xRoot - yRoots[k]) < TOLERANCE) {
                        result.points.push(c23.multiply(s * s * s).add(c22.multiply(s * s).add(c21.multiply(s).add(c20))));
                        break checkRoots;
                      }
                    }
                  }
                }
              } catch (err) {
                _iterator10.e(err);
              } finally {
                _iterator10.f();
              }
            }
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier3Circle
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Circle",
      value: function intersectBezier3Circle(p1, p2, p3, p4, c, r) {
        return Intersection.intersectBezier3Ellipse(p1, p2, p3, p4, c, r, r);
      }
      /**
       *  intersectBezier3Ellipse
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {module:kld-intersections.Point2D} ec
       *  @param {number} rx
       *  @param {number} ry
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Ellipse",
      value: function intersectBezier3Ellipse(p1, p2, p3, p4, ec, rx, ry) {
        var a, b, c, d; // temporary variables
        // c3, c2, c1, c0; // coefficients of cubic

        var result = new Intersection("No Intersection"); // Calculate the coefficients of cubic polynomial

        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.add(b.add(c.add(p4)));
        var c3 = new Point2D(d.x, d.y);
        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.add(b.add(c));
        var c2 = new Point2D(d.x, d.y);
        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.add(b);
        var c1 = new Point2D(c.x, c.y);
        var c0 = new Point2D(p1.x, p1.y);
        var rxrx = rx * rx;
        var ryry = ry * ry;
        var poly = new Polynomial(c3.x * c3.x * ryry + c3.y * c3.y * rxrx, 2 * (c3.x * c2.x * ryry + c3.y * c2.y * rxrx), 2 * (c3.x * c1.x * ryry + c3.y * c1.y * rxrx) + c2.x * c2.x * ryry + c2.y * c2.y * rxrx, 2 * c3.x * ryry * (c0.x - ec.x) + 2 * c3.y * rxrx * (c0.y - ec.y) + 2 * (c2.x * c1.x * ryry + c2.y * c1.y * rxrx), 2 * c2.x * ryry * (c0.x - ec.x) + 2 * c2.y * rxrx * (c0.y - ec.y) + c1.x * c1.x * ryry + c1.y * c1.y * rxrx, 2 * c1.x * ryry * (c0.x - ec.x) + 2 * c1.y * rxrx * (c0.y - ec.y), c0.x * c0.x * ryry - 2 * c0.y * ec.y * rxrx - 2 * c0.x * ec.x * ryry + c0.y * c0.y * rxrx + ec.x * ec.x * ryry + ec.y * ec.y * rxrx - rxrx * ryry);
        var roots = poly.getRootsInInterval(0, 1);

        var _iterator11 = _createForOfIteratorHelper(roots),
            _step11;

        try {
          for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
            var t = _step11.value;
            result.points.push(c3.multiply(t * t * t).add(c2.multiply(t * t).add(c1.multiply(t).add(c0))));
          }
        } catch (err) {
          _iterator11.e(err);
        } finally {
          _iterator11.f();
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier3Line
       *
       *  Many thanks to Dan Sunday at SoftSurfer.com.  He gave me a very thorough
       *  sketch of the algorithm used here.  Without his help, I'm not sure when I
       *  would have figured out this intersection problem.
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Line",
      value: function intersectBezier3Line(p1, p2, p3, p4, a1, a2) {
        var a, b, c, d; // temporary variables
        // c3, c2, c1, c0; // coefficients of cubic
        // cl; // c coefficient for normal form of line
        // n; // normal for normal form of line

        var min = a1.min(a2); // used to determine if point is on line segment

        var max = a1.max(a2); // used to determine if point is on line segment

        var result = new Intersection("No Intersection"); // Start with Bezier using Bernstein polynomials for weighting functions:
        //     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
        //
        // Expand and collect terms to form linear combinations of original Bezier
        // controls.  This ends up with a vector cubic in t:
        //     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
        //             /\                  /\                /\       /\
        //             ||                  ||                ||       ||
        //             c3                  c2                c1       c0
        // Calculate the coefficients

        a = p1.multiply(-1);
        b = p2.multiply(3);
        c = p3.multiply(-3);
        d = a.add(b.add(c.add(p4)));
        var c3 = new Vector2D(d.x, d.y);
        a = p1.multiply(3);
        b = p2.multiply(-6);
        c = p3.multiply(3);
        d = a.add(b.add(c));
        var c2 = new Vector2D(d.x, d.y);
        a = p1.multiply(-3);
        b = p2.multiply(3);
        c = a.add(b);
        var c1 = new Vector2D(c.x, c.y);
        var c0 = new Vector2D(p1.x, p1.y); // Convert line to normal form: ax + by + c = 0
        // Find normal to line: negative inverse of original line's slope

        var n = new Vector2D(a1.y - a2.y, a2.x - a1.x); // Determine new c coefficient

        var cl = a1.x * a2.y - a2.x * a1.y; // ?Rotate each cubic coefficient using line for new coordinate system?
        // Find roots of rotated cubic

        var roots = new Polynomial(n.dot(c3), n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots(); // Any roots in closed interval [0,1] are intersections on Bezier, but
        // might not be on the line segment.
        // Find intersections and calculate point coordinates

        var _iterator12 = _createForOfIteratorHelper(roots),
            _step12;

        try {
          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var t = _step12.value;

            if (0 <= t && t <= 1) {
              // We're within the Bezier curve
              // Find point on Bezier
              var p5 = p1.lerp(p2, t);
              var p6 = p2.lerp(p3, t);
              var p7 = p3.lerp(p4, t);
              var p8 = p5.lerp(p6, t);
              var p9 = p6.lerp(p7, t);
              var p10 = p8.lerp(p9, t); // See if point is on line segment
              // Had to make special cases for vertical and horizontal lines due
              // to slight errors in calculation of p10

              if (a1.x === a2.x) {
                if (min.y <= p10.y && p10.y <= max.y) {
                  result.status = "Intersection";
                  result.appendPoint(p10);
                }
              } else if (a1.y === a2.y) {
                if (min.x <= p10.x && p10.x <= max.x) {
                  result.status = "Intersection";
                  result.appendPoint(p10);
                }
              } else if (min.x <= p10.x && p10.x <= max.x && min.y <= p10.y && p10.y <= max.y) {
                result.status = "Intersection";
                result.appendPoint(p10);
              }
            }
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }

        return result;
      }
      /**
       *  intersectBezier3Polygon
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Polygon",
      value: function intersectBezier3Polygon(p1, p2, p3, p4, points) {
        return Intersection.intersectBezier3Polyline(p1, p2, p3, p4, closePolygon(points));
      }
      /**
       *  intersectBezier3Polyline
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Polyline",
      value: function intersectBezier3Polyline(p1, p2, p3, p4, points) {
        var result = new Intersection("No Intersection");
        var len = points.length;

        for (var i = 0; i < len - 1; i++) {
          var a1 = points[i];
          var a2 = points[i + 1];
          var inter = Intersection.intersectBezier3Line(p1, p2, p3, p4, a1, a2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectBezier3Rectangle
       *
       *  @param {module:kld-intersections.Point2D} p1
       *  @param {module:kld-intersections.Point2D} p2
       *  @param {module:kld-intersections.Point2D} p3
       *  @param {module:kld-intersections.Point2D} p4
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectBezier3Rectangle",
      value: function intersectBezier3Rectangle(p1, p2, p3, p4, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectBezier3Line(p1, p2, p3, p4, min, topRight);
        var inter2 = Intersection.intersectBezier3Line(p1, p2, p3, p4, topRight, max);
        var inter3 = Intersection.intersectBezier3Line(p1, p2, p3, p4, max, bottomLeft);
        var inter4 = Intersection.intersectBezier3Line(p1, p2, p3, p4, bottomLeft, min);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectCircleCircle
       *
       *  @param {module:kld-intersections.Point2D} c1
       *  @param {number} r1
       *  @param {module:kld-intersections.Point2D} c2
       *  @param {number} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCircleCircle",
      value: function intersectCircleCircle(c1, r1, c2, r2) {
        var result; // Determine minimum and maximum radii where circles can intersect

        var r_max = r1 + r2;
        var r_min = Math.abs(r1 - r2); // Determine actual distance between circle circles

        var c_dist = c1.distanceFrom(c2);

        if (c_dist > r_max) {
          result = new Intersection("Outside");
        } else if (c_dist < r_min) {
          result = new Intersection("Inside");
        } else {
          result = new Intersection("Intersection");
          var a = (r1 * r1 - r2 * r2 + c_dist * c_dist) / (2 * c_dist);
          var h = Math.sqrt(r1 * r1 - a * a);
          var p = c1.lerp(c2, a / c_dist);
          var b = h / c_dist;
          result.points.push(new Point2D(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x)));
          result.points.push(new Point2D(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x)));
        }

        return result;
      }
      /**
       *  intersectCircleEllipse
       *
       *  @param {module:kld-intersections.Point2D} cc
       *  @param {number} r
       *  @param {module:kld-intersections.Point2D} ec
       *  @param {number} rx
       *  @param {number} ry
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCircleEllipse",
      value: function intersectCircleEllipse(cc, r, ec, rx, ry) {
        return Intersection.intersectEllipseEllipse(cc, r, r, ec, rx, ry);
      }
      /**
       *  intersectCircleLine
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCircleLine",
      value: function intersectCircleLine(c, r, a1, a2) {
        var result;
        var a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y);
        var b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y));
        var cc = c.x * c.x + c.y * c.y + a1.x * a1.x + a1.y * a1.y - 2 * (c.x * a1.x + c.y * a1.y) - r * r;
        var deter = b * b - 4 * a * cc;

        if (deter < 0) {
          result = new Intersection("Outside");
        } else if (deter === 0) {
          result = new Intersection("Tangent"); // NOTE: should calculate this point
        } else {
          var e = Math.sqrt(deter);
          var u1 = (-b + e) / (2 * a);
          var u2 = (-b - e) / (2 * a);

          if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
            if (u1 < 0 && u2 < 0 || u1 > 1 && u2 > 1) {
              result = new Intersection("Outside");
            } else {
              result = new Intersection("Inside");
            }
          } else {
            result = new Intersection("Intersection");

            if (0 <= u1 && u1 <= 1) {
              result.points.push(a1.lerp(a2, u1));
            }

            if (0 <= u2 && u2 <= 1) {
              result.points.push(a1.lerp(a2, u2));
            }
          }
        }

        return result;
      }
      /**
       *  intersectCirclePolygon
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCirclePolygon",
      value: function intersectCirclePolygon(c, r, points) {
        return Intersection.intersectCirclePolyline(c, r, closePolygon(points));
      }
      /**
       *  intersectCirclePolyline
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCirclePolyline",
      value: function intersectCirclePolyline(c, r, points) {
        var result = new Intersection("No Intersection");
        var len = points.length;
        var inter;

        for (var i = 0; i < len - 1; i++) {
          var a1 = points[i];
          var a2 = points[i + 1];
          inter = Intersection.intersectCircleLine(c, r, a1, a2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        } else {
          result.status = inter.status;
        }

        return result;
      }
      /**
       *  intersectCircleRectangle
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} r
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectCircleRectangle",
      value: function intersectCircleRectangle(c, r, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectCircleLine(c, r, min, topRight);
        var inter2 = Intersection.intersectCircleLine(c, r, topRight, max);
        var inter3 = Intersection.intersectCircleLine(c, r, max, bottomLeft);
        var inter4 = Intersection.intersectCircleLine(c, r, bottomLeft, min);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        } else {
          result.status = inter1.status;
        }

        return result;
      }
      /**
       *  intersectEllipseEllipse
       *
       *  This code is based on MgcIntr2DElpElp.cpp written by David Eberly.  His
       *  code along with many other excellent examples are avaiable at his site:
       *  http://www.magic-software.com
       *
       *  NOTE: Rotation will need to be added to this function
       *
       *  @param {module:kld-intersections.Point2D} c1
       *  @param {number} rx1
       *  @param {number} ry1
       *  @param {module:kld-intersections.Point2D} c2
       *  @param {number} rx2
       *  @param {number} ry2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectEllipseEllipse",
      value: function intersectEllipseEllipse(c1, rx1, ry1, c2, rx2, ry2) {
        var a = [ry1 * ry1, 0, rx1 * rx1, -2 * ry1 * ry1 * c1.x, -2 * rx1 * rx1 * c1.y, ry1 * ry1 * c1.x * c1.x + rx1 * rx1 * c1.y * c1.y - rx1 * rx1 * ry1 * ry1];
        var b = [ry2 * ry2, 0, rx2 * rx2, -2 * ry2 * ry2 * c2.x, -2 * rx2 * rx2 * c2.y, ry2 * ry2 * c2.x * c2.x + rx2 * rx2 * c2.y * c2.y - rx2 * rx2 * ry2 * ry2];
        var yPoly = bezout(a, b);
        var yRoots = yPoly.getRoots();
        var epsilon = 1e-3;
        var norm0 = (a[0] * a[0] + 2 * a[1] * a[1] + a[2] * a[2]) * epsilon;
        var norm1 = (b[0] * b[0] + 2 * b[1] * b[1] + b[2] * b[2]) * epsilon;
        var result = new Intersection("No Intersection");

        for (var y = 0; y < yRoots.length; y++) {
          var xPoly = new Polynomial(a[0], a[3] + yRoots[y] * a[1], a[5] + yRoots[y] * (a[4] + yRoots[y] * a[2]));
          var xRoots = xPoly.getRoots();

          for (var x = 0; x < xRoots.length; x++) {
            var tst = (a[0] * xRoots[x] + a[1] * yRoots[y] + a[3]) * xRoots[x] + (a[2] * yRoots[y] + a[4]) * yRoots[y] + a[5];

            if (Math.abs(tst) < norm0) {
              tst = (b[0] * xRoots[x] + b[1] * yRoots[y] + b[3]) * xRoots[x] + (b[2] * yRoots[y] + b[4]) * yRoots[y] + b[5];

              if (Math.abs(tst) < norm1) {
                result.appendPoint(new Point2D(xRoots[x], yRoots[y]));
              }
            }
          }
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectEllipseLine
       *
       *  NOTE: Rotation will need to be added to this function
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} rx
       *  @param {number} ry
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectEllipseLine",
      value: function intersectEllipseLine(c, rx, ry, a1, a2) {
        var result;
        var orign = new Vector2D(a1.x, a1.y);
        var dir = Vector2D.fromPoints(a1, a2);
        var center = new Vector2D(c.x, c.y);
        var diff = orign.subtract(center);
        var mDir = new Vector2D(dir.x / (rx * rx), dir.y / (ry * ry));
        var mDiff = new Vector2D(diff.x / (rx * rx), diff.y / (ry * ry));
        var a = dir.dot(mDir);
        var b = dir.dot(mDiff);
        c = diff.dot(mDiff) - 1.0;
        var d = b * b - a * c;

        if (d < 0) {
          result = new Intersection("Outside");
        } else if (d > 0) {
          var root = Math.sqrt(d); // eslint-disable-line no-shadow

          var t_a = (-b - root) / a;
          var t_b = (-b + root) / a;

          if ((t_a < 0 || 1 < t_a) && (t_b < 0 || 1 < t_b)) {
            if (t_a < 0 && t_b < 0 || t_a > 1 && t_b > 1) {
              result = new Intersection("Outside");
            } else {
              result = new Intersection("Inside");
            }
          } else {
            result = new Intersection("Intersection");

            if (0 <= t_a && t_a <= 1) {
              result.appendPoint(a1.lerp(a2, t_a));
            }

            if (0 <= t_b && t_b <= 1) {
              result.appendPoint(a1.lerp(a2, t_b));
            }
          }
        } else {
          var t = -b / a;

          if (0 <= t && t <= 1) {
            result = new Intersection("Intersection");
            result.appendPoint(a1.lerp(a2, t));
          } else {
            result = new Intersection("Outside");
          }
        }

        return result;
      }
      /**
       *  intersectEllipsePolygon
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} rx
       *  @param {number} ry
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectEllipsePolygon",
      value: function intersectEllipsePolygon(c, rx, ry, points) {
        return Intersection.intersectEllipsePolyline(c, rx, ry, closePolygon(points));
      }
      /**
       *  intersectEllipsePolyline
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} rx
       *  @param {number} ry
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectEllipsePolyline",
      value: function intersectEllipsePolyline(c, rx, ry, points) {
        var result = new Intersection("No Intersection");
        var len = points.length;

        for (var i = 0; i < len - 1; i++) {
          var b1 = points[i];
          var b2 = points[i + 1];
          var inter = Intersection.intersectEllipseLine(c, rx, ry, b1, b2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectEllipseRectangle
       *
       *  @param {module:kld-intersections.Point2D} c
       *  @param {number} rx
       *  @param {number} ry
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectEllipseRectangle",
      value: function intersectEllipseRectangle(c, rx, ry, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectEllipseLine(c, rx, ry, min, topRight);
        var inter2 = Intersection.intersectEllipseLine(c, rx, ry, topRight, max);
        var inter3 = Intersection.intersectEllipseLine(c, rx, ry, max, bottomLeft);
        var inter4 = Intersection.intersectEllipseLine(c, rx, ry, bottomLeft, min);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectLineLine
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectLineLine",
      value: function intersectLineLine(a1, a2, b1, b2) {
        var result;
        var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if (u_b !== 0) {
          var ua = ua_t / u_b;
          var ub = ub_t / u_b;

          if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            result = new Intersection("Intersection");
            result.points.push(new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
          } else {
            result = new Intersection("No Intersection");
          }
        } else if (ua_t === 0 || ub_t === 0) {
          result = new Intersection("Coincident");
        } else {
          result = new Intersection("Parallel");
        }

        return result;
      }
      /**
       *  intersectLinePolygon
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectLinePolygon",
      value: function intersectLinePolygon(a1, a2, points) {
        return Intersection.intersectLinePolyline(a1, a2, closePolygon(points));
      }
      /**
       *  intersectLinePolyline
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectLinePolyline",
      value: function intersectLinePolyline(a1, a2, points) {
        var result = new Intersection("No Intersection");
        var len = points.length;

        for (var i = 0; i < len - 1; i++) {
          var b1 = points[i];
          var b2 = points[i + 1];
          var inter = Intersection.intersectLineLine(a1, a2, b1, b2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectLineRectangle
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectLineRectangle",
      value: function intersectLineRectangle(a1, a2, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectLineLine(min, topRight, a1, a2);
        var inter2 = Intersection.intersectLineLine(topRight, max, a1, a2);
        var inter3 = Intersection.intersectLineLine(max, bottomLeft, a1, a2);
        var inter4 = Intersection.intersectLineLine(bottomLeft, min, a1, a2);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectPolygonPolygon
       *
       *  @param {Array<module:kld-intersections.Point2D>} points1
       *  @param {Array<module:kld-intersections.Point2D>} points2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPolygonPolygon",
      value: function intersectPolygonPolygon(points1, points2) {
        return Intersection.intersectPolylinePolyline(closePolygon(points1), closePolygon(points2));
      }
      /**
       *  intersectPolygonPolyline
       *
       *  @param {Array<module:kld-intersections.Point2D>} points1
       *  @param {Array<module:kld-intersections.Point2D>} points2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPolygonPolyline",
      value: function intersectPolygonPolyline(points1, points2) {
        return Intersection.intersectPolylinePolyline(closePolygon(points1), points2);
      }
      /**
       *  intersectPolygonRectangle
       *
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPolygonRectangle",
      value: function intersectPolygonRectangle(points, r1, r2) {
        return Intersection.intersectPolylineRectangle(closePolygon(points), r1, r2);
      }
      /**
       *  intersectPolylinePolyline
       *
       *  @param {Array<module:kld-intersections.Point2D>} points1
       *  @param {Array<module:kld-intersections.Point2D>} points2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPolylinePolyline",
      value: function intersectPolylinePolyline(points1, points2) {
        var result = new Intersection("No Intersection");
        var len = points1.length;

        for (var i = 0; i < len - 1; i++) {
          var a1 = points1[i];
          var a2 = points1[i + 1];
          var inter = Intersection.intersectLinePolyline(a1, a2, points2);
          result.appendPoints(inter.points);
        }

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectPolylineRectangle
       *
       *  @param {Array<module:kld-intersections.Point2D>} points
       *  @param {module:kld-intersections.Point2D} r1
       *  @param {module:kld-intersections.Point2D} r2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectPolylineRectangle",
      value: function intersectPolylineRectangle(points, r1, r2) {
        var min = r1.min(r2);
        var max = r1.max(r2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectLinePolyline(min, topRight, points);
        var inter2 = Intersection.intersectLinePolyline(topRight, max, points);
        var inter3 = Intersection.intersectLinePolyline(max, bottomLeft, points);
        var inter4 = Intersection.intersectLinePolyline(bottomLeft, min, points);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectRectangleRectangle
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectRectangleRectangle",
      value: function intersectRectangleRectangle(a1, a2, b1, b2) {
        var min = a1.min(a2);
        var max = a1.max(a2);
        var topRight = new Point2D(max.x, min.y);
        var bottomLeft = new Point2D(min.x, max.y);
        var inter1 = Intersection.intersectLineRectangle(min, topRight, b1, b2);
        var inter2 = Intersection.intersectLineRectangle(topRight, max, b1, b2);
        var inter3 = Intersection.intersectLineRectangle(max, bottomLeft, b1, b2);
        var inter4 = Intersection.intersectLineRectangle(bottomLeft, min, b1, b2);
        var result = new Intersection("No Intersection");
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
          result.status = "Intersection";
        }

        return result;
      }
      /**
       *  intersectRayRay
       *
       *  @param {module:kld-intersections.Point2D} a1
       *  @param {module:kld-intersections.Point2D} a2
       *  @param {module:kld-intersections.Point2D} b1
       *  @param {module:kld-intersections.Point2D} b2
       *  @returns {module:kld-intersections.Intersection}
       */

    }, {
      key: "intersectRayRay",
      value: function intersectRayRay(a1, a2, b1, b2) {
        var result;
        var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if (u_b !== 0) {
          var ua = ua_t / u_b;
          result = new Intersection("Intersection");
          result.points.push(new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
        } else if (ua_t === 0 || ub_t === 0) {
          result = new Intersection("Coincident");
        } else {
          result = new Intersection("Parallel");
        }

        return result;
      }
    }]);

    return Intersection;
  }();

  // Todo: If completed for more shapes, this could be usable as a
  //   utility on top of kld-intersections; svg-intersections?
  /**
   * @param {PlainObject} cfg
   * @param {ImageDataShape} cfg.shape
   * @param {ShapeInfo} cfg.props
   * @throws {TypeError} Unexpected shape
   * @returns {external:KLDRectangle|external:KLDCircle|external:KLDPolygon}
   */
  function getShapeInfoForShapeAndProps ({shape, props}) {
    let shapeInfo;
    switch (shape) {
    case 'rect': {
      // https://github.com/thelonious/kld-intersections/issues/65
      if (!('top' in props)) {
        props = {
          top: props.y, left: props.x, width: props.width, height: props.height
        };
      }
      shapeInfo = ShapeInfo.rectangle(props);
      break;
    } case 'circle': {
      shapeInfo = ShapeInfo.circle(props);
      break;
    } case 'polygon': {
      shapeInfo = ShapeInfo.polygon(props.points);
      break;
    }
    default:
      throw new TypeError('Unexpected shape ' + shape);
    }
    return shapeInfo;
  }

  /**
  * @param {SVGRect} svgEl
  * @throws {TypeError} Unexepcted element type
  * @returns {Object<string, number>}
  */
  function getOffsetAdjustedPropsObject (svgEl) {
    const getOffsetAdjustedAnimVal = (o, prop) => {
      o[prop] = svgEl[prop].animVal.value;

      // Adjust for offsets
      if (prop === 'points') {
        o[prop] = o[prop].split(/,\s*/u).map((xOrY, i) => {
          return xOrY % 0
            ? xOrY - this.imageMapOffsetLeft
            : xOrY - this.imageMapOffsetTop;
        }).join(',');
      } else if (['x', 'cx'].includes(prop)) {
        o[prop] -= this.imageMapOffsetLeft;
      } else if (['y', 'cy'].includes(prop)) {
        o[prop] -= this.imageMapOffsetTop;
      }
      return o;
    };
    let propArr;
    switch (svgEl.localName.toLowerCase()) {
    case 'rect':
      propArr = ['x', 'y', 'width', 'height'];
      break;
    case 'circle':
      propArr = ['cx', 'cy', 'r'];
      break;
    case 'polygon':
      propArr = ['points'];
      break;
    default:
      throw new TypeError('Unexpected SVG element type!');
    }
    // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
    return propArr.reduce(getOffsetAdjustedAnimVal, {});
  }

  /**
  * @typedef {PlainObject} Rectangle
  * @property {Float} x
  * @property {Float} y
  * @property {Float} width
  * @property {Float} height
  */

  /**
  * @typedef {PlainObject} Circle
  * @property {Float} cx
  * @property {Float} cy
  * @property {Float} r
  */

  /**
  * @typedef {PlainObject} Polygon
  * @property {Float[]} points
  */

  /**
  * @typedef {Rectangle|Circle|Polygon} ShapeInfo
  */

  /**
   * @todo Replace with the following if implemented:
   *   https://github.com/thelonious/kld-intersections/issues/20
   * @param {SVGRect} rect Our copy-paste rectangle
   * @param {GenericArray} shapeInfo
   * @param {ImageDataShape} shapeInfo."0" The shape
   * @param {ShapeInfo} shapeInfo."1" The properties of the shape
   * @throws {Error}
   * @returns {boolean}
   */
  function svgContains (rect, [shape, props]) {
    const rectProps = getOffsetAdjustedPropsObject.call(this, rect);
    const rectX2 = rectProps.x + rectProps.width;
    const rectY2 = rectProps.y + rectProps.height;
    switch (shape) {
    case 'rect':
      return (props.x >= rectProps.x &&
          props.y >= rectProps.y &&
          props.x + props.width <= rectX2 &&
          props.y + props.height <= rectY2
      );
    case 'circle':
      return (props.cx - props.r >= rectProps.x &&
          props.cy - props.r >= rectProps.y &&
          props.cx + props.r <= rectX2 &&
          props.cy + props.r <= rectY2
      );
    case 'polygon':
      return props.points.every((pt, i) => {
        return i % 0
          ? pt >= rectProps.x && pt <= rectX2
          : pt >= rectProps.y && pt <= rectY2;
      });
    default:
      throw new Error('Unrecognized shape type');
    }
  }

  /**
   * @param {Event} e
   * @returns {void}
   */
  function textDragRectangleMouseDown (e) {
    this.shapesAdded = new Map();
    e.preventDefault();
    // Todo: Jamilih should support SVG (through options mode); then use here

    this.originalX = e.pageX;
    this.originalY = e.pageY;

    this.rect.setAttribute('x', this.originalX);
    this.rect.setAttribute('y', this.originalY);

    /*
    // Todo: Works to restore triangle, but causes selected rectangles to
    //   be hidden
    svg.style.left = originalX + 'px';
    svg.style.top = originalY + 'px';
    rect.setAttribute('x', 10);
    rect.setAttribute('y', 10);
    */

    if (this._mode === 'view') {
      this.showGuidesUnlessViewMode('view-guides');
      this.removeAllShapes();
    }
  }

  /**
   * @param {Event} e
   * @returns {Promise<void>}
   */
  async function textDragRectangleMouseUp (e) {
    e.preventDefault();
    this.resetRect();
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      switch (permission) {
      case 'granted':
        break;
      case 'denied':
        return;
      case 'default': default:
        return;
      }
    }
    $$1(this.copiedText).value = this.lastText;
    /*
    // Not yet supported
    const clipboardPermission =
      await navigator.permissions.request('clipboard-write');
    console.log('clipboardPermission', clipboardPermission);
    if (clipboardPermission === 'granted') {
      const data = new DataTransfer();
      // Todo: Option to switch between `text/html` and `text/plain`?
      data.items.add('text/html', this.lastText);
      await navigator.clipboard.write(data);
      // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#Parameters
      new Notification( // eslint-disable-line no-new
        // Todo: This i18n should accept a formatted string
        _('Copied ') + this.lastText, {
          lang: document.documentElement.lang,
          dir: document.documentElement.dir
        }
      );
    }
    */
    if (this._mode === 'view') {
      this.removeAllShapes();
      this.showGuidesUnlessViewMode('view');
    }
  }

  /**
   * @param {Event} e
   * @returns {void}
   */
  function textDragRectangleMouseMove (e) {
    e.preventDefault();
    if (e.buttons !== 1) {
      return;
    }
    // Though we could put this in mouseDown, it interferes with normal
    //   clicking behavior of map areas
    if (this.svg.style.display !== 'block') {
      this.svg.style.display = 'block';
    }
    if (e.pageX > this.originalX && e.pageY > this.originalY) {
      this.rect.setAttribute('width', e.pageX - this.originalX);
      this.rect.setAttribute('height', e.pageY - this.originalY);

      const [xZoom, yZoom] = this.getZoom();
      this.lastText = [
        ...this.querySelectorAll('.textImageMap > map > area')
      ].reduce((s, area) => {
        const {
          shape, coords, alt
        } = area;
        const coordArr = coords.split(/,\s*/u);
        const coordArrFloats = coordArr.map((n) => Number.parseFloat(n));
        let props;
        switch (shape) {
        case 'rect': {
          const [x, y, x2, y2] = coordArrFloats;
          const width = x2 - x;
          const height = y2 - y;
          // console.log('shape', shape, {x, y, width, height});
          props = {x, y, width, height};
          break;
        } case 'circle': {
          const [cx, cy, r] = coordArrFloats;
          // console.log('shape', shape, {cx, cy, r});
          props = {cx, cy, r};
          break;
        } case 'polygon': {
          props = {points: coordArrFloats};
          break;
        } default: {
          throw new TypeError('Unexpected map type!');
        }
        }
        if (xZoom !== 1 || yZoom !== 1) {
          Object.entries(props).forEach(([prop, val], i) => {
            val *= (
              (prop === 'points' && i % 0) ||
              ['cx', 'cx', 'width'].includes(prop)
            )
              ? xZoom
              : yZoom;

            props[prop] = val;
          });
        }

        const userRectInfo = getShapeInfoForShapeAndProps({
          shape: 'rect',
          props: getOffsetAdjustedPropsObject.call(this, this.rect)
        });

        const areaMapInfo = getShapeInfoForShapeAndProps({shape, props});

        const intersection = Intersection.intersect(
          // SvgShapes.element(rect),
          userRectInfo,
          areaMapInfo
        );

        const areaMatched = intersection.points.length ||
          svgContains.call(this, this.rect, [shape, props]);
        if (areaMatched) {
          const json = JSON.stringify([shape, {coords: coordArr}]);
          // Don't keep adding when reencountering same shape
          if (!this.shapesAdded.has(json)) {
            this.addShape(shape, {coords: coordArr});
            this.shapesAdded.set(json, true);
          }
        }
        return s + ' ' + (
          areaMatched
            ? alt
            : ''
        );
      }, '').slice(1);
    }
  }

  const copyTextDragRectangle = {
    /**
     * Namespace the method as this is used as a mixin.
     * @returns {void}
     */
    init_copyTextDragRectangle () {
      this.setupSVG();
      this.resetRect();
      this.lastText = '';
    },
    setupSVG () {
      const SVG_NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(SVG_NS, 'svg');
      const maxWidth = 2000;
      const maxHeight = maxWidth;
      svg.setAttribute('width', maxWidth);
      svg.setAttribute('height', maxHeight);
      svg.setAttribute('class', 'selector');
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', 10);
      rect.setAttribute('y', 10);
      rect.setAttribute('class', 'selector');
      svg.append(rect);

      this.svg = svg;
      this.rect = rect;
    },
    resetRect () {
      this.rect.setAttribute('width', 10);
      this.rect.setAttribute('height', 10);
      this.svg.style.display = 'none';
    },

    enableTextDragRectangle ({pos, mode}) {
      const {left, top} = pos;
      this.imageMapOffsetLeft = left;
      this.imageMapOffsetTop = top;

      this.querySelector('.textImageMap').before(this.svg);

      this._mode = mode;

      this.mouseupListener = textDragRectangleMouseUp.bind(this);
      this.mousemoveListener = textDragRectangleMouseMove.bind(this);
      this.mousedownListener = textDragRectangleMouseDown.bind(this);

      window.addEventListener('mouseup', this.mouseupListener);
      window.addEventListener('mousemove', this.mousemoveListener);

      this.querySelector('.textImageMap').addEventListener(
        'mousedown', this.mousedownListener
      );
    },

    disableTextDragRectangle () {
      window.removeEventListener('mouseup', this.mouseupListener);
      window.removeEventListener('mousemove', this.mousemoveListener);

      this.querySelector('.textImageMap').removeEventListener(
        'mousedown',
        this.mousedownListener
      );
    },

    /**
     * @typedef {"edit"|"view-guides"|"view"} Mode
     */

    /**
     * @param {Mode} mode
     * @returns {void}
     */
    toggleTextDragRectangleByMode (mode) {
      if (mode === 'edit') {
        this.disableTextDragRectangle();
      } else {
        this.enableTextDragRectangle({
          pos: this.getPosition(),
          mode
        });
      }
    }
  };

  // Todo: Only build a new area if not one for the same coords already
  //   (in which case, supplement it with `alt` and `mouseover`)
  /**
   * @returns {void}
   */
  function mouseover () {
    this.dataset.tippyContent = this.alt;
    tippy('[data-tippy-content]', {
      followCursor: true,
      distance: 10,
      placement: 'right'
    });
  }

  const buildArea = ({shape, alt, coords}) => {
    const atts = {
      shape,
      coords,
      $on: {mouseover}
    };
    if (alt !== undefined) { // Todo: Make this a nullable type for Jamilih
      atts.alt = alt;
    }
    return ['area', atts];
  };

  /**
   *
   */
  class TextImageMap extends HyperHTMLElement {
    /**
     * @returns {string[]}
     */
    static get observedAttributes () { return ['name', 'src', 'copiedText']; }

    /**
     * @returns {void}
     */
    created () {
      // this.shadowRoot = this.attachShadow({mode: 'open'}); // `this.shadowRoot`
      // this.shadowRoot.append();
      // this.addEventListener();
      this.init_copyTextDragRectangle();
    }

    /**
     * @returns {{name: string, src: string}}
     */
    get defaultState () {
      return {name: this.name, src: this.src};
    }

    /**
     * @param {string} name
     * @param {string} prev
     * @param {string} curr
     * @returns {void}
     */
    attributeChangedCallback (name, prev, curr) {
      this.setState({
        [name]: curr
      });

      if (this.name && this.src) {
        this.render();
      }
    }

    /**
    * @returns {void}
    */
    buildImageMapAreasForFormObject () {
      const map = this.querySelector(`map[name]`);
      imageMapFormObjectInfo(this._formObj).map(({shape, alt, coords}) => {
        return {shape, alt, coords: coords.join(',')};
      }).filter(({shape, alt, coords}) => {
        const existingArea = map.querySelector(
          `area[shape="${shape}"][coords="${coords}"]`
        );
        if (existingArea) {
          existingArea.alt = alt || '';
          existingArea.addEventListener('mouseover', mouseover);
        }
        return !existingArea;
      }).forEach(({shape, alt, coords}) => {
        jml(...buildArea({
          shape,
          alt,
          coords
        }), map);
      });
    }

    /**
     * @returns {HTMLDivElement}
     */
    render () {
      /*
        // Todo: To scale, we could add onload=${this}
        onload () => {
          this.naturalWidth, this.naturalHeight;
        }}
      */
      return this.html`<div class="textImageMap">
      <map name=${this.state.name} />
      <img
        class="textImageMap"
        alt=${_('Selected image for map')}
        usemap=${'#' + this.state.name}
        src=${this.state.src}
      />
    </div>`;
    }
  }

  // Mixin is for compartmentalization of jQuery, not based on unique features
  Object.assign(TextImageMap.prototype, jqueryImageMaps, copyTextDragRectangle);

  TextImageMap.define('text-image-map'); // {extends: 'ul'}

  /**
   *
   */
  class CopiedText extends HyperHTMLElement {
    /**
     * @returns {string}
     */
    get value () {
      return this.querySelector('textarea.copiedText').value;
    }

    /**
     * @param {string} val
     * @returns {void}
     */
    set value (val) {
      this.querySelector('textarea.copiedText').value = val;
    }

    /**
     * @returns {HTMLFieldsetElement}
     */
    render () {
      return this.html`<fieldset class="copiedText">
      <legend>${_('Copied text')}</legend>
      <textarea
        class="copiedText"
        aria-label=${_('Text to copy')}
        placeholder=${_('Text to copy')}
      />
    </fieldset>`;
    }
  }

  CopiedText.define('copied-text');

  /**
   *
   */
  class ZoomControl extends HyperHTMLElement {
    /**
     * @returns {string[]}
     */
    static get booleanAttributes () { return ['disabled']; }

    /**
     * @returns {string[]}
     */
    static get observedAttributes () { return ['value']; }

    static formAssociated = true;

    /**
    * @returns {void}
    */
    created () {
      this.internals_ = this.attachInternals();
      this.value_ = '';
      this.render();
    }

    /* eslint-disable jsdoc/require-jsdoc -- Form boilerplate */
    get value () { return this.value_; }
    set value (v) { this.value_ = v; }
    get form () { return this.internals_.form; }
    get name () { return this.getAttribute('name'); }
    get type () { return this.localName; }
    get validity () { return this.internals_.validity; }
    get validationMessage () { return this.internals_.validationMessage; }
    get willValidate () { return this.internals_.willValidate; }

    checkValidity () { return this.internals_.checkValidity(); }
    reportValidity () { return this.internals_.reportValidity(); }
    /* eslint-enable jsdoc/require-jsdoc -- Form boilerplate */

    /**
    * @param {Event} e
    * @returns {void}
    */
    handleClick (e) {
      e.preventDefault();
      e.stopPropagation();

      const zoomInput = this.querySelector('input.zoom');
      const val = Number(zoomInput.value || 100);

      if (!this.matches(':disabled')) {
        if (typeof val !== 'number' || Number.isNaN(val)) {
          this.internals_.setValidity(
            {
              customError: true
            },
            _('You must enter a number.')
          );
          this.focus();
          this.reportValidity();
          return;
        }
        if (val <= 0) {
          console.log('111', val);
          this.internals_.setValidity(
            {
              customError: true,
              rangeUnderflow: true
            },
            _('You must enter a number greater than 0.')
          );
          this.focus();
          this.reportValidity();
          return;
        }
      }
      this.dispatchEvent(new Event('click', {
        bubbles: true
      }));
    }

    /**
    * @returns {void}
    */
    disable () {
      this.disabled = true;
    }

    /**
    * @returns {void}
    */
    enable () {
      this.disabled = false;
    }

    /**
    * @returns {void}
    */
    handleChange () {
      this.internals_.setFormValue(this.value_);
    }

    /**
     * @returns {HTMLFieldsetElement}
     */
    render () {
      return this.html`<fieldset class="zoom">
      <legend>${_('Zoom')}</legend>
      <input
        type="number"
        class="zoom"
        disabled=${this.disabled}
        onchange=${this.handleChange}
        aria-label=${_('zoom')}
        placeholder=${_('zoom percentage')}
      />
      ${nbsp}
      <a
        href="#"
        hidden=${this.disabled}
        class="zoom btn"
        onclick=${this.handleClick}
      >
        ${_('zoom')}
      </a>
    </fieldset>`;
    }
  }

  ZoomControl.define('zoom-control');

  /**
   *
   */
  class ImageMapModeChooser extends HyperHTMLElement {
    /**
     * @returns {string[]}
     */
    static get observedAttributes () {
      return ['mode', 'text-image-map', 'readonly'];
    }
    // created () {
    // }

    /**
    * @param {Event} e
    * @returns {void}
    */
    handleClick (e) {
      const mode = e.target.value;

      const textImageMap = $(this.textImageMap);
      textImageMap.toggleTextDragRectangleByMode(mode);

      const {width, height, shapes} = textImageMap.getImageMapInfo();
      if (!width || !height) { // Nothing else to do yet
        return;
      }
      // console.log('width', width, height, shapes, mode);

      this.dispatchEvent(new CustomEvent('form-to-image-map', {
        bubbles: true,
        detail: {
          args: {
            mode,
            textImageMap
          },
          callback () {
            textImageMap.copyImageMapsToImageMap({width, height, shapes});
            textImageMap.showGuidesUnlessViewMode(mode);
          }
        }
      }));
    }

    /**
    * @returns {HTMLFieldsetElement}
    */
    render () {
      return this.html`<fieldset class="shapeControls">
      <legend>${this.readonly ? _('View mode?') : _('Edit mode?')}</legend>
      ${[
    ...(this.readonly ? [] : [['Edit', 'edit']]),
    ['View with guides', 'view-guides'],
    ['View', 'view']
  ].map(([i18nKey, mode]) => {
    const html = HyperHTMLElement.hyper;
    return html`<label>
      <input
        name="mode"
        type="radio"
        onclick=${this.handleClick}
        checked=${this.mode === mode}
        value=${mode}
      />
      ${nbsp + _(i18nKey) + nbsp.repeat(3)}
      </label>
    `;
  })
}
    </fieldset>`;
    }
  }

  ImageMapModeChooser.define('image-map-mode-chooser');

  const nbsp2 = nbsp.repeat(2);

  /**
   * @returns {Promise<void>}
   */
  async function requireTextBehavior () {
    requireText = this.checked;
    setRequireText(requireText);
    $$('.requireText').forEach((textarea) => {
      textarea.required = requireText;
    });
    await prefs.setPref('requireText', requireText);
  }

  /**
   * @typedef {GenericArray} LastPrefs
   * @property {string} 0
   * @property {string} 1
   */

  /**
   * @param {FormData} map
   * @returns {Promise<LastPrefs>}
   */
  function rememberLastMap (map) {
    return Promise.all([
      prefs.setPref('lastMapName', map.name),
      prefs.setPref('lastImageSrc', map.mapURL)
    ]);
  }

  /**
   * @param {PlainObject} cfg
   * @param {string} cfg.url
   * @param {"GET"|"DELETE"} cfg.method
   * @returns {JSON}
   */
  async function fetchJSON ({url, method}) {
    const response = await fetch(url, {method});
    return response.json();
  }

  /**
  * @param {PlainObject} cfg
  * @param {string} cfg.name
  * @param {"GET"|"DELETE"} [cfg.method="GET"]
  * @returns {FormObject}
  */
  function getMapDataByName ({name, method = 'GET'}) {
    return fetchJSON({
      method,
      url: '/maps/maps/' + encodeURIComponent(name)
    });
  }

  /**
  * @param {PlainObject} cfg
  * @param {string} cfg.url
  * @param {"PUT"|"POST"} cfg.method
  * @param {FormObject} cfg.data
  * @returns {JSON} Unused
  */
  async function updateServerJSON ({url, method, data}) {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   *
   */
  class TextImageMapForm extends HyperHTMLElement {
    static get observedAttributes () {
      return [
        'text-image-map',
        'last-map-name',
        'last-image-src',
        'require-text'
      ];
    }

    /**
     * @returns {void}
     */
    submitFormClick () {
      // To try again, we reset invalid forms, e.g., from previous bad JSON
      [...this.querySelector('form').elements].forEach((ctrl) => {
        ctrl.setCustomValidity('');
      });
    }

    /**
     * @param {event} e
     * @returns {Promise<void>}
     */
    async mapDelete (e) {
      e.preventDefault();
      const mapName = this.querySelector('input[name="name"]').value;
      if (!mapName) {
        // eslint-disable-next-line no-alert -- Temporary
        alert(_('You must provide a map name'));
        return;
      }
      // eslint-disable-next-line no-alert -- Temporary
      const ok = confirm(
        _(`Are you sure you wish to delete the map: ${mapName} ?`)
      );
      if (!ok) {
        return;
      }
      /* const results = */ await getMapDataByName({
        name: mapName, method: 'DELETE'
      });

      const textImageMap = this.querySelector(this.textImageMap);
      await textImageMap.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
      await rememberLastMap({
        name: null,
        mapURL: null
      });

      // eslint-disable-next-line no-alert -- Temporary
      alert(_('Map deleted!'));
    }

    /**
     * @param {event} e
     * @returns {Promise<void>}
     */
    async imageFormSubmit (e) {
      e.preventDefault();
      const formObj = serialize(this.querySelector('form'), {hash: true});
      const mapName = this.querySelector('input[name="name"]').value;
      if (!mapName) {
        // eslint-disable-next-line no-alert -- Temporary
        alert(_('You must provide a map name'));
        return;
      }
      const map = await getMapDataByName({name: mapName});
      if (map.name) {
        // eslint-disable-next-line no-alert -- Temporary
        const ok = confirm(
          _(`Do you wish to overwrite the existing map: ${mapName}?`)
        );
        if (!ok) {
          return;
        }
      }

      const cfg = map.name
        // Overwrite
        ? {
          url: '/maps/maps/' + encodeURIComponent(mapName),
          method: 'PUT'
        }
        // Create new
        : {
          url: '/maps/maps/',
          method: 'POST'
        };

      await updateServerJSON({...cfg, data: formObj});
      this.dispatchEvent(new CustomEvent('form-view-update', {
        bubbles: true,
        detail: {
          type: 'form',
          formObj
        }
      }));
      await rememberLastMap(formObj);

      // eslint-disable-next-line no-alert -- Temporary
      alert(map.name ? _('Map overwritten!') : _('Map created!'));
    }

    /**
     * @returns {Promise<void>}
     */
    async mapNameChange () {
      const form = this.querySelector('form');
      const textImageMap = this.querySelector(this.textImageMap);
      const el = form.querySelector('input[name="name"]');
      if (!el.value) {
        this.dispatchEvent(new CustomEvent('form-update', {
          detail: {}
        }));
        return;
      }
      form.disabled = true;
      const map = await getMapDataByName({name: el.value});
      // eslint-disable-next-line no-console -- Debugging
      console.log('maps', map);
      if (map.name) {
        await textImageMap.removeAllShapes({
          sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
        });
        this.dispatchEvent(new CustomEvent('form-update', {
          detail: map
        }));
        await rememberLastMap(map);
      }
      form.disabled = false;
    }

    render () {
      return this.html`<form
      id="imageForm"
      onsubmit=${this.imageFormSubmit}
    >
      ${
  // Todo: Add placeholder by inserting object with `html` and `placeholder`
  (async () => {
    // Let user set values asynchronously (e.g., getting async prefs to
    //   set properties), without our needing here to bake in, or accept
    //   binding for, storage preferences
    await this.customLoader;

    // https://github.com/WebReflection/hyperHTML-Element/pull/76
    const html = HyperHTMLElement.hyper;

    return html`
    <label>
      ${_('Image map name') + nbsp2}
      <input
        name="name"
        size="100"
        value=${this.defaultMapName}
        onchange=${this.mapNameChange}
      />
      ${nbsp2}
      <button onclick=${this.mapDelete}>${_('x')}</button>
    </label>
    <br />
    <label>
      ${_('Image map URL') + nbsp2}
      <input
        name="mapURL"
        size="100"
        required="required"
        value=${this.defaultImageSrc}
      />
    </label>
    `;
  })()}
      <br />
      <fieldset>
        <div>
          <div class="imageRegions">
            <h1 id="imageAreas">${_('Image areas')}</h1>
            <ol id="imageRegions"></ol>
          </div>
          <div>
            <h2 class="preferences">${_('Preferences')}</h2>
            <label>
              <input
                type="checkbox"
                checked=${this.requireText}
                onclick=${requireTextBehavior}
              />
              ${nbsp2 + _('Require text')}
            </label>
          </div>
        </div>
      </fieldset>
      <input
        type="submit"
        value=${_('Save')}
        onclick=${this.submitFormClick}
      />
    ]);
    `;
    }
  }

  TextImageMapForm.define('text-image-map-form');

  /**
   *
   */
  class SerializedJSON extends HyperHTMLElement {
    static get observedAttributes () { return ['form-id']; }

    /**
     * @param {FormObject} formObj
     * @returns {void}
     */
    updateSerializedJSON (formObj) {
      this.querySelector('#serializedJSON').value =
        JSON.stringify(formObj, null, 2);
    }

    /**
     * @returns {void}
     */
    serializedJSONInput () {
      let formObj;
      const textarea = this.querySelector('textarea');
      try {
        formObj = JSON.parse(textarea.value);
      } catch (err) {
        textarea.setCustomValidity(_('JSON Did not parse', err));
        textarea.reportValidity();
        return;
      }
      textarea.setCustomValidity('');

      this.dispatchEvent(new CustomEvent('form-view-update', {
        bubbles: true,
        detail: {
          type: 'json',
          formObj,
          formControl: textarea
        }
      }));
    }

    /**
     * @returns {FormObject}
     */
    getJSON () {
      return JSON.parse(this.querySelector('textarea').value);
    }

    render () {
      return this.html`<section class="serialized">
      <h2>${_('Serialized JSON')}</h2>
      <textarea
        id="serializedJSON"
        form=${this.formId}
        'aria-label'=${_('Serialized JSON')}
        oninput=${this.serializedJSONInput}
      >
      </textarea>
    </section>`;
    }
  }

  SerializedJSON.define('serialized-json');

  /**
   *
   */
  class SerializedHTML extends HyperHTMLElement {
    static get observedAttributes () { return ['form-id']; }

    /**
    * @returns {void}
    */
    serializedHTMLInput () {
      const textarea = this.querySelector('textarea');
      const html = new DOMParser().parseFromString(textarea.value, 'text/html');
      const map = html.querySelector('map[name]');
      const img = html.querySelector(
        `img[usemap="#${map.name}"][src]`
      );
      const areas = [...map.querySelectorAll('area')];
      if (!map || !areas.length || !img) {
        textarea.setCustomValidity(!map
          ? _('Missing <map name=> element ')
          : (!areas.length)
            ? _('Missing <area>')
            : _('Missing matching <img usemap= src=>'));
        textarea.reportValidity();
        return;
      }
      textarea.setCustomValidity('');

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
      this.dispatchEvent(new CustomEvent('form-view-update', {
        bubbles: true,
        detail: {
          type: 'html',
          formObj,
          formControl: textarea
        }
      }));
    }

    render () {
      return this.html`<section class="serialized">
      <h2>${_('Serialized HTML')}</h2>
      <textarea
        id="serializedHTML"
        form=${this.formId}
        'aria-label'=${_('Serialized HTML')}
        oninput=${this.serializedHTMLInput}
      />
    </section>`;
    }
  }

  SerializedHTML.define('serialized-html');

  // Left-facing:
  // '\u{1F50D}' (or if necessary as surrogates: '\uD83D\uDD0D')
  // Or for right-facing:
  // '\u{1F50E}' (or if necessary as surrogates: '\uD83D\uDD0E')
  const magnifyingGlassText = '\u{1F50D}';

  /**
   *
   */
  class FindBar extends HyperHTMLElement {
    /**
     * @returns {void}
     */
    /*
    created () {
      // this.shadowRoot = this.attachShadow({mode: 'open'}); // `this.shadowRoot`
      // this.shadowRoot.append();
      // this.addEventListener();
      // this.init_mixin1();
    }
    */

    /**
     * @returns {void}
     */
    created () {
      this.addEventListener('find-bar-cancel', () => {
        this.style.display = 'none';
      });

      body.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.style.display = 'none';
          return;
        }
        if (!e.repeat && e.key === 'f' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          this.style.display = 'block';
          const findBar = this.querySelector('input.findBar');
          findBar.select();
          findBar.focus();
        }
      });

      this.render();
    }

    /**
    * @param {Event} e
    * @returns {void}
    */
    handleCancel (e) {
      this.dispatchEvent(new CustomEvent('find-bar-cancel', {
        bubbles: true,
        cancelable: true,
        // Triggers outside of shadowRoot
        composed: true
      }));
    }

    /**
     * @returns {HTMLDivElement}
     */
    render () {
      // type=search gives clear-results button
      return this.html`<div class="findBar">
      ${magnifyingGlassText}
      ${nbsp.repeat(2)}
      <input
        type="search"
        class="findBar"
        placeholder=${_('Search for text')}
      />
      ${nbsp}
      <button class="cancel" onclick=${this.handleCancel}>${_('x')}</button>
    </div>`;
    }
  }

  FindBar.define('find-bar'); // {extends: 'ul'}

  const getBeginAndEndIndexes = ({formObjectInfo, value, isFirstMode}) => {
    const segmentIndexes = [];
    let text = '';
    formObjectInfo.some(({shape, alt, coords}, i) => {
      segmentIndexes.push(text.length);
      text += alt + ' ';
      // Shortcut if only need the first match and we already match
      return isFirstMode && text.includes(value);
    });
    // text = text.slice(0, -1);
    const foundBeginStringIndex = text.indexOf(value);
    if (foundBeginStringIndex === -1) {
      // NOT FOUND
      return [];
    }

    let tooFar = false;
    let beginSegmentIndexIndex = segmentIndexes.findIndex(
      (segmentIndex, i) => {
        tooFar = segmentIndex > foundBeginStringIndex;
        return tooFar || segmentIndex === foundBeginStringIndex;
      }
    );

    let endSegmentIndexIndex = 0;
    if (beginSegmentIndexIndex === -1) {
      // Begins somewhere after beginning of last segment
      beginSegmentIndexIndex = segmentIndexes.length - 1;
      endSegmentIndexIndex = beginSegmentIndexIndex;
    } else if (tooFar) {
      // Begins somewhere before beginning of found segment
      beginSegmentIndexIndex--;
    }

    // If haven't found ending yet, calculate the end
    if (!endSegmentIndexIndex) {
      const endIndex = foundBeginStringIndex + value.length;
      endSegmentIndexIndex = segmentIndexes.slice(
        beginSegmentIndexIndex
      ).findIndex((segmentIndex) => {
        return segmentIndex >= endIndex;
      });
      if (endSegmentIndexIndex === -1) {
        // Ending must be after the beginning of the last segment
        endSegmentIndexIndex = segmentIndexes.length - 1;
      } else {
        // We sliced this off for efficiency, so need to add back
        endSegmentIndexIndex += beginSegmentIndexIndex - 1;
      }
    }
    return [beginSegmentIndexIndex, endSegmentIndexIndex];
  };

  // import _ from '../../../external/i18n/i18n.js';

  /**
   * @callback GetFormObject
   * @returns {FormObject}
   */

  /**
  * @callback UseViewMode
  * @returns {Promise<boolean>}
  */

  /**
   * Also has "abstract" methods `getFormObject` and `useViewMode` which user
   *   must supply as well as a `textImageMap` string selector.
   */
  class FindImageRegionBar extends HyperHTMLElement {
    /**
     * @returns {string[]}
     */
    static get observedAttributes () { return ['textImageMap']; }

    /**
     * @returns {void}
     */
    created () {
      this.render();
      this.querySelector(
        'input.findBar'
      ).addEventListener('input', (e) => {
        // Function must be set by user
        let formObj;
        this.dispatchEvent(new CustomEvent('get-form-object', {
          detail (obj) {
            formObj = obj;
          }
        }));

        const {value} = e.target;

        // Todo: Allow `all` mode
        // Todo: Even for "first" mode, we need to get "next"
        const mode = 'first';
        const isFirstMode = mode === 'first';

        const formObjectInfo = imageMapFormObjectInfo(formObj);
        const [
          beginSegmentIndexIndex, endSegmentIndexIndex
        ] = getBeginAndEndIndexes({
          formObjectInfo, value, isFirstMode
        });

        /**
         * @param {{shape: ImageDataShape, coords}} cfg
         * @returns {Promise<void>}
         */
        const blinkShape = async ({shape, coords}) => {
          let attSel;
          switch (shape) {
          case 'rect': {
            const [x, y, x2, y2] = coords;
            const width = x2 - x;
            const height = y2 - y;
            attSel = `[x="${x}"][y="${y}"][width="${width}"][height="${height}"]`;
            break;
          }
          case 'circle': {
            const [cx, cy, r] = coords;
            attSel = `[cx="${cx}"][cy="${cy}"][r="${r}"]`;
            break;
          }
          case 'polygon': {
            attSel = `[points=${coords.join(',')}]`;
            break;
          }
          default:
            throw new Error('Unexpected shape ' + shape);
          }

          const matchedShape = $$1(`${this.textImageMap} svg ${shape}${attSel}`);
          matchedShape.classList.add('borderBlink');
          await timeout(3000);
          matchedShape.classList.remove('borderBlink');
          /*
          // Gets correct <area>, but doesn't work to style apparently
          const matchedArea =
            $(`${this.textImageMap} area[coords="${coords.join(',')}"]`);
          console.log('matchedArea', matchedArea);
          matchedArea.classList.add('borderBlink');
          await timeout(10000);
          matchedArea.classList.remove('borderBlink');
          */
        };

        let viewMode;
        this.dispatchEvent(new CustomEvent('use-view-mode', {
          detail: (obj) => {
            viewMode = obj;
            const textImageMap = $$1(this.textImageMap);
            formObjectInfo.slice(
              beginSegmentIndexIndex, endSegmentIndexIndex + 1
            ).forEach(async (
              {shape, coords}
            ) => {
              // Todo: Highlight
              // console.log('matching shape & coords', shape, coords);
              if (viewMode) {
                // We don't have displayed shapes now (with accurate
                //  dimensions), so we have to build our own elements
                textImageMap.addShape(shape, {coords});
                await timeout(500);
              }
              blinkShape({shape, coords});
              if (viewMode) {
                await timeout(2000);
                textImageMap.removeShape();
              }
            });
          }
        }));
      });
    }

    /**
     * @returns {HTMLDivElement}
     */
    render () {
      return this.html`<find-bar />`;
    }
  }

  FindImageRegionBar.define('find-image-region-bar'); // {extends: 'ul'}

  const zoomControl = ({mode, prefs}) => {
    // Triggerable by image-map-mode-chooser
    const toggleZoomByMode = ({newValue: newMode}) => {
      if (newMode === 'edit') {
        zc.disable();
      } else {
        zc.enable();
      }
    };
    prefs.listen('mode', toggleZoomByMode);

    const zoomClick = (e) => {
      const textImageMap = $$1('text-image-map');
      textImageMap.zoomImageMapAndResize(Number(e.target.value));
    };

    const zc = jml('zoom-control', {
      $on: {click: zoomClick}
    });

    toggleZoomByMode({newValue: mode});

    return zc;
  };

  const imageMapModeChooser = ({
    mode, prefs,
    editableFormToImageMap
  }) => {
    const formToImageMap = async function (e) {
      const formObj = $('serialized-json').getJSON();
      const {args, callback} = e.detail;
      await prefs.setPref('mode', args.mode);
      await editableFormToImageMap({...args, formObj});
      // eslint-disable-next-line promise/prefer-await-to-callbacks -- Easier
      callback();
    };

    return jml('image-map-mode-chooser', {
      mode,
      // Could give more precise selector on right side
      'text-image-map': 'text-image-map',
      $on: {
        'form-to-image-map': formToImageMap
      }
    });
  };

  const shapeControls = ({
    setFormObjCoordsAndUpdateViewForMap
  }) => {
    /**
     * @param {Event} e
     * @returns {Promise<void>}
     */
    async function rectClick (e) {
      e.preventDefault();
      const textImageMap = $$1('text-image-map');
      await textImageMap.addRect({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    }
    /**
     * @param {Event} e
     * @returns {Promise<void>}
     */
    async function circleClick (e) {
      e.preventDefault();
      const textImageMap = $$1('text-image-map');
      await textImageMap.addCircle({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    }
    /**
     * @param {Event} e
     * @returns {Promise<void>}
     */
    async function removeClick (e) {
      e.preventDefault();
      const textImageMap = $$1('text-image-map');
      await textImageMap.removeShape({
        sharedBehaviors: {
          setFormObjCoordsAndUpdateViewForMap
        }
      });
    }
    /**
     * @param {Event} e
     * @returns {Promise<void>}
     */
    async function removeAllClick (e) {
      e.preventDefault();
      const textImageMap = $$1('text-image-map');
      await textImageMap.removeAllShapes({
        sharedBehaviors: {setFormObjCoordsAndUpdateViewForMap}
      });
    }

    return jml('div', {class: 'shapeControls'}, [
      ['a', {
        href: '#',
        id: 'rect',
        class: 'btn',
        $on: {click: rectClick}
      }, [_('Add rectangle')]],
      ['a', {
        href: '#',
        id: 'circle',
        class: 'btn',
        $on: {click: circleClick}
      }, [_('Add circle')]],
      ['a', {
        href: '#',
        id: 'remove',
        class: 'btn',
        $on: {click: removeClick}
      }, [_('Remove shape')]],
      ['a', {
        href: '#',
        id: 'remove-all',
        class: 'btn',
        $on: {click: removeAllClick}
      }, [_('Remove all shapes')]]
    ]);
  };

  const textImageMapContainer = ({
    mode, prefs, editableFormToImageMap,
    setFormObjCoordsAndUpdateViewForMap
  }) => ['section', [
    ['h2', [_('Image map')]],
    ['div', [
      shapeControls({
        setFormObjCoordsAndUpdateViewForMap
      }),
      ['br', 'br'],
      imageMapModeChooser({
        mode, prefs, editableFormToImageMap
      }),
      zoomControl({mode, prefs}),
      ['copied-text'],
      ['text-image-map', {
        copiedText: 'copied-text'
      }]
    ]]
  ]];

  /**
   * @param {FormObjectInfo} cfg
   * @returns {void}
   */
  function setFormObjCoords$1 ({
    index, shape, coords, text, formObj, oldShapeToDelete
  }) {
    if (shape === undefined) {
      delete formObj[index + '_shape'];
    } else {
      formObj[index + '_shape'] = shape;
    }
    if (text === undefined) {
      delete formObj[index + '_text'];
    } else {
      formObj[index + '_text'] = text;
    }

    /**
     * @param {string} item
     * @param {Integer} i
     * @returns {void}
     */
    function circleOrRect (item, i) {
      if (coords[i] === undefined) {
        delete formObj[index + '_' + item];
      } else {
        formObj[index + '_' + item] = coords[i];
      }
    }
    switch (shape || oldShapeToDelete) {
    case 'circle':
      // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
      ['circlex', 'circley', 'circler'].forEach(circleOrRect);
      break;
    case 'rect':
      // eslint-disable-next-line unicorn/no-array-callback-reference -- Safe
      ['leftx', 'topy', 'rightx', 'bottomy'].forEach(circleOrRect);
      break;
    case 'poly':
      formObj[index + '_xy'] = coords;
      break;
    }
  }

  const main = ({
    formID, prefs,
    mode, styles,
    behaviors,
    requireText
  }) => {
    const {editableFormToImageMap} = getFormToImageMap({
      prefs, styles, setFormObjCoordsAndUpdateViewForMap
    });
    /**
    * @typedef {PlainObject} FormObjectInfo
    * @todo Complete
    * @property {Integer} index
    * @property {ImageDataShape} shape
    * @property {Integer[]} coords
    * @property {string} text
    * @property {FormObject} formObj
    * @property {ImageDataShape} oldShapeToDelete
    */

    /**
    * @typedef {FormObjectInfo} FormObjectEditInfo
    * @property {HTMLElement} formControl
    * @property {boolean} removeAll
    */

    /**
     * @param {FormObjectInfo} cfg
     * @returns {void}
    */
    function setFormObjCoordsAndUpdateViewForMap ({
      index, shape, coords, text, formObj, oldShapeToDelete,
      formControl, removeAll
    }) {
      setFormObjCoords$1({index, shape, coords, text, formObj, oldShapeToDelete});
      this.dispatchEvent(new CustomEvent('form-view-update', {
        detail: {
          type: 'map',
          formObj,
          formControl,
          removeAll
        }
      }));
    }

    /**
     * @returns {void}
     */
    function formOnconnected () {
      this.customLoader = (async () => {
        const [
          lastMapName,
          lastImageSrc
        ] = await Promise.all([
          this.prefs.getPref('lastMapName'),
          this.prefs.getPref('lastImageSrc')
        ]);

        this.defaultMapName = lastMapName;
        this.defaultImageSrc = lastImageSrc;
      })();
    }

    /**
     * @todo Change to instance of `TextImageMap` component
     * @param {TextImageMap} textImageMap
     * @param {FormObject} formObj
     * @returns {Promise<void>}
     */
    async function updateMap (textImageMap, formObj) {
      await textImageMap.removeAllShapes();
      await Promise.all(
        imageMapFormObjectInfo(formObj).map(({shape, alt, coords}) => {
          return textImageMap.addShape(shape, {coords});
        })
      );
      const newMode = await prefs.getPref('mode');
      textImageMap.showGuidesUnlessViewMode(newMode);
    }

    /**
     * @param {FormObject} formObj
     * @returns {void}
     */
    function deserializeForm (formObj) {
      const imageRegions = $('#imageRegions');
      empty$1(imageRegions);
      let highestID = -1;
      Object.entries(formObj).forEach(([key, shape]) => {
        if (!key.endsWith('_shape')) {
          return;
        }
        const currID = Number.parseInt(key.slice(0, -('_shape'.length)));
        formShapeSelection({
          requireText,
          prefs,
          imageRegionID: currID
        });
        const lastRegion = imageRegions.lastElementChild;
        const shapeSelector = lastRegion.querySelector('select');
        shapeSelector.name = key; // Number in key may differ
        shapeSelector.selectedIndex = ['rect', 'circle', 'poly'].indexOf(shape);
        shapeSelector.dispatchEvent(new Event('change'));
        if (shape === 'poly') {
          const polySetsStart = formObj[currID + '_xy'].length / 2;
          let polySets = polySetsStart;
          while (polySets > 2) { // Always have at least 2
            $('.polyDivHolder').append(
              editPolyXY(currID, polySets === polySetsStart)
            );
            polySets--;
          }
        }
        if (currID > highestID) {
          highestID = currID;
        }
      });
      setImageRegionID(highestID + 1);
      try {
        deserialize(form, formObj);
      } catch (err) {
        this.setCustomValidity(_('Could not deserialize', err));
        this.reportValidity();
        return;
      }
      this.setCustomValidity('');
      // Bad values from JSON not allowed to even be set, so
      //   this is not activating
      // this.reportValidity();
    }

    /**
     * @param {boolean} removeAll
     * @returns {void}
     */
    function updateSerializedHTML (removeAll) {
      if (removeAll) {
        $('#serializedHTML').value = '';
        return;
      }
      const clonedTextImageMap = $('.textImageMap').cloneNode(true);
      clonedTextImageMap.querySelector('svg').remove();
      $('#serializedHTML').value =
        clonedTextImageMap.outerHTML;
    }

    /**
     * @typedef {PlainObject<string, string>} FormObject
     */

    /**
     * @param {PlainObject} cfg
     * @param {"form"|"map"|"html"|"json"} cfg.type
     * @param {FormObject} cfg.formObj
     * @param {HTMLElement} [cfg.formControl] Control on which to report errors in
     *   form-building. Not needed if this is a change to the whole form.
     * @param {boolean} cfg.removeAll
     * @returns {void}
     */
    async function updateViews ({type, formObj, formControl, removeAll}) {
      if (type !== 'form') {
        deserializeForm.call(formControl, formObj);
      }
      const textImageMap = $('text-image-map');
      if (!removeAll) {
        // Don't actually set the map and update
        if (type !== 'map') {
          await editableFormToImageMap({
            formObj,
            textImageMap: $('text-image-map')
          }); // Sets text image map
        }
        // Even for map, we must update apparently because change in form
        //   control positions after adding controls changes positions within
        //   map as well
        await updateMap(textImageMap, formObj);
      }
      if (type !== 'html') {
        updateSerializedHTML(removeAll);
      }
      if (type !== 'json') {
        $('serialized-json').updateSerializedJSON(removeAll ? {} : formObj);
      }
      textImageMap.setFormObject(formObj);
    }

    return jml('div', {
      role: 'main' // For Axe tests (Accessbility)
    }, [
      ['div', {$on: {
        // Triggered by `text-image-map-form`, `serialized-html`, and
        //   `serialized-json`
        'form-view-update' ({detail}) {
          updateViews(detail);
        }
      }}, [
        ['h1', [_('MapText')]],
        ['text-image-map-form', {
          id: formID,
          $on: {
            'form-update' ({detail: updatedValue}) {
              $('serialized-json').updateSerializedJSON(updatedValue);
              $('serialized-json').serializedJSONInput();
            }
          },
          // Todo: Fix this
          onconnected: formOnconnected,
          // Could define more specific selector
          'text-image-map': 'text-image-map',
          'require-text': requireText
        }],
        ['serialized-html', {
          'form-id': formID
        }],
        ['serialized-json', {
          'form-id': formID
        }],
        textImageMapContainer({
          mode, prefs, editableFormToImageMap,
          setFormObjCoordsAndUpdateViewForMap
        })
      ]]
    ], body);
  };

  const styles = styles$1([
    'index.css'
  ]);

  const prefs$1 = new SimplePrefs({namespace: 'maptext-', defaults: {
    lastMapName: `map0`,
    lastImageSrc: 'sample-image-texts/Handwriting_of_Shoghi_Effendi_1919-1.jpg',
    requireText: true,
    mode: 'edit'
  }});

  document.title = _('MapText demo');
  // Todo: Detect locale and use https://github.com/brettz9/i18nizeElement
  document.documentElement.lang = 'en-US';
  document.documentElement.dir = 'ltr';

  (async () => {
  const [
    requireText,
    mode
  ] = await Promise.all([
    prefs$1.getPref('requireText'),
    prefs$1.getPref('mode'),
    styles.load()
  ]);

  setRequireText$1(requireText);

  const formID = 'main-text-image-map-form';
  main({
    formID,
    prefs: prefs$1,
    mode,
    styles,
    requireText
  });

  formShapeSelection({prefs: prefs$1, requireText});

  // Is this necessary now?
  $$1(`#${formID}`).mapNameChange();

  findImageRegionBar({prefs: prefs$1});
  })();

}());
//# sourceMappingURL=maptext-index.rollup.js.map
