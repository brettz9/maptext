/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import cookieSign from 'cookie-signature';

import codeCoverageTask from '@cypress/code-coverage/task';
import useBabelrc from '@cypress/code-coverage/use-babelrc';
import {
  addAccounts, removeAccounts
} from 'nogin/app/server/modules/db-basic.js';
import {
  generateLoginKeys
} from 'nogin/app/public-test-utils/db-basic-testing-extensions.cjs';

import noginConfig from '../../nogin.js';

/**
 * @type {Cypress.PluginConfig}
 */
const exprt = (on, config) => {
  const {
    secret,
    // NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS
  } = noginConfig;

  /**
   * @param {PlainObject} cfg
   * @param {string} cfg.cookieValue
   * @returns {string}
   */
  function generateLoginKey ({
    cookieValue
  }) {
    // Note that if switching to https://github.com/ebourmalo/cookie-encrypter ,
    //  the prefix is `e:`.
    // https://github.com/expressjs/cookie-parser/blob/677ed0825057d20a0e121757e5fd8a39973d2431/index.js#L134
    const cookieParserPrefix = 's:';
    // Todo: Change this if switching to https://github.com/ebourmalo/cookie-encrypter
    const key = cookieParserPrefix + cookieSign.sign(
      cookieValue, secret
    );
    return key;
  }

  config.env = config.env || {};

  config.env.secret = secret;
  config.env.NL_EMAIL_USER = NL_EMAIL_USER;
  config.env.NL_EMAIL_PASS = NL_EMAIL_PASS;

  // We want `process.env` for login credentials
  // Default in the same way as `app.get('env')`
  // eslint-disable-next-line node/no-process-env -- Configurable
  config.env.env = process.env.NODE_ENV || 'development';

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  codeCoverageTask(on, config);

  on('task', {
    /**
     * Simulates calling login command (when POSTing to route `/`
     * (with "remember me") to set a cookie). Need to use return result
     * to set a cookie.
     *
     * Used in `root.js` test to ensure that user gets auto-logged in
     * after an initial log-in (and that the cookie is still set after
     * the user is redirected to `/home`).
     * @param {PlainObject} cfg
     * @param {string|string[]} cfg.user
     * @param {string|string[]} cfg.ip
     * @returns {Promise<string[]>} The key
     */
    async generateLoginKey ({user, ip}) {
      const [cookieValue] = await generateLoginKeys({
        user,
        ip
      });
      return generateLoginKey({cookieValue});
    },

    /**
     * Simulates `/reset`.
     * @returns {DeleteWriteOpResult}
     */
    deleteAllAccounts () {
      return removeAccounts({all: true});
    },
    /**
     * Simulates POST to `/signup` and subsequent visit to `/activation?c=`
     * for that account (with the `c` value obtained from the activation email).
     * @returns {Promise<AccountInfo>}
     */
    async addAccount () {
      return (await addAccounts({
        name: ['Brett'],
        email: [NL_EMAIL_USER],
        user: ['bretto'],
        pass: [NL_EMAIL_PASS],
        country: ['US'],
        activationCode: [
          // eslint-disable-next-line max-len -- Long
          '0bb6ab8966ef06be4bea394871138169$f5eb3f8e56b03d24d5dd025c480daa51e55360cd674c0b31bb20993e153a6cb1'
        ],
        activated: [true]
      }))[0];
    }
  });

  on('file:preprocessor', useBabelrc);
  return config;
};

export default exprt;
