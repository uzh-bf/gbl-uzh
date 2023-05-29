describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/admin/login')
    cy.findByText('Sign in').click()
    cy.findByText('Sign in with Auth0').click()

    // login procedure on auth0
    cy.origin('https://uzh-bf-dev.eu.auth0.com', () => {
      cy.get('input[name="username"]').type('cypress@gbl.uzh.ch')
      cy.get('input[name="password"]').type('testing2023!')
      cy.get('form[data-form-primary="true"]').submit()
    })
  })
})
