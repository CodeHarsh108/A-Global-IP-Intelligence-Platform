// cypress/e2e/sample_spec.cy.js

describe('Landing Page', () => {
  it('loads and displays the login button', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Login').should('be.visible');
  });
});
