describe('UI tests', function () {
  describe('Main application', function () {
    beforeEach(() => {
      cy.loginWithSession();
      cy.visit(`http://localhost:8050/maps/index-es.html`);
    });
    it('Has name input', function () {
      cy.get('input[name="name"]');
    });

    it('Clicks into edit mode', function () {
      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Detecting?
      cy.wait(1000);
      cy.get('image-map-mode-chooser input[value="edit"]').click();
    });

    it('Clicks into edit mode by label', function () {
      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Detecting?
      cy.wait(1000);
      cy.get('image-map-mode-chooser label').first().click();
    });

    it('Clicks into view mode', function () {
      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Detecting?
      cy.wait(1000);
      cy.get('image-map-mode-chooser input[value="view"]').click();
    });

    it('Clicks into view with guides mode', function () {
      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Detecting?
      cy.wait(1000);
      cy.get('image-map-mode-chooser input[value="view-guides"]').click();
    });
  });

  it('Passes accessibility', function () {
    cy.visitURLAndCheckAccessibility(`http://localhost:8050/`);
  });
});
