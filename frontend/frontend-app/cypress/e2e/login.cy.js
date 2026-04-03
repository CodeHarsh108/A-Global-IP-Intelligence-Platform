// cypress/e2e/login.cy.js

describe('Login Flow', () => {
  it('should show error on invalid login', () => {
    cy.visit('/login');
    cy.get('input[type=email]').type('wrong@example.com');
    cy.get('input[type=password]').type('wrongpass');
    cy.get('button').contains('Login').click();
    cy.contains('Invalid credentials').should('exist');
  });
});
