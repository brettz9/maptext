// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add(
//   'drag', { prevSubject: 'element'}, (subject, options) => { ... }
// );
//
//
// -- This is a dual command --
// Cypress.Commands.add(
//   'dismiss', { prevSubject: 'optional'}, (subject, options) => { ... }
// );
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
* @external CypressVisitOptions
* @see https://docs.cypress.io/api/commands/visit.html
*/

/**
 * @returns {void}
 */
function checkAccessibility () {
  cy.injectAxe();
  // Configure aXe and test the page at initial load
  cy.configureAxe({
    // Todo: Reenable this accessibility rule when have time to fix
    // See https://www.deque.com/axe/axe-for-web/documentation/api-documentation/#user-content-parameters-1
    // For Bootstrap's lack of built-in color contrast, see
    //  https://getbootstrap.com/docs/4.0/getting-started/accessibility/#color-contrast
    rules: [{
      id: 'color-contrast',
      enabled: false
    }]
    /*
    branding: {
      brand: String,
      application: String
    },
    reporter: 'option',
    checks: [Object],
    rules: [Object],
    locale: Object
    */
  });
  cy.checkA11y();
}

// Not currently in use, but can use to only
//  apply accessibility after visiting a page and
//  waiting for some condition
Cypress.Commands.add(
  'checkAccessibility',
  checkAccessibility
);

Cypress.Commands.add(
  'visitURLAndCheckAccessibility',
  /**
   * @param {string} url
   * @param {external:CypressVisitOptions} options
   * @returns {void}
   */
  (url, options) => {
    cy.visit(url, options);
    checkAccessibility();
  }
);

Cypress.Commands.add(
  'login',
  ({
    user, ip,
    secure = false,
    badSecret = null // For testing forging attempts
  } = {}) => {
    return cy.task('generateLoginKey', {
      user, ip, badSecret
      // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then((key) => {
      // eslint-disable-next-line promise/no-nesting -- Pass on `key`
      return cy.setCookie('login', key, {
        secure
      // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
      }).then(() => {
        return key;
      });
    });
  }
);

Cypress.Commands.add(
  'getToken',
  (url = '/') => {
    cy.visit(url);
    let token;
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    return cy.get('meta[name=csrf-token]').then(($meta) => {
      token = $meta[0].getAttribute('content');
      return cy.log(token);
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then(() => {
      return token;
    });
  }
);

Cypress.Commands.add(
  'loginWithSession',
  () => {
    const NL_EMAIL_PASS = Cypress.env('NL_EMAIL_PASS');
    cy.task('deleteAllAccounts');
    cy.task('addAccount');

    const url = '/';

    // Not just login, but get session, so will be shown `/home`
    //   without redirect upon visit

    // It is no longer sufficient to make a request now that we have CSRF, and
    //   we don't want to expose an API to get the token
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    return cy.getToken(url).then((token) => {
      return cy.request({
        url,
        method: 'POST',
        timeout: 50000,
        headers: {
          'X-XSRF-Token': token
        },
        body: {
          user: 'bretto',
          pass: NL_EMAIL_PASS
        }
      });
    });
  }
);
