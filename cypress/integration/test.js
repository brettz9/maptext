
describe('UI tests', function () {
  it('Main application: Has name input', () => {
    cy.visit(`http://localhost:8050/`);
    cy.get('input[name="name"]');
  });

  it('Passes accessibility', () => {
    cy.visitURLAndCheckAccessibility(`http://localhost:8050/`);
  });
});
