Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('register', (firstname: string, lastname: string, email: string, password: string) => {
  cy.visit('/auth/register')
  cy.get('#firstname').type(firstname)
  cy.get('#lastname').type(lastname)
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#confirmpassword').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
  cy.clearCookies()
})

Cypress.Commands.add('mockGoogleAuth', () => {
  cy.intercept('GET', '**/api/auth/providers', {
    fixture: 'google-provider.json'
  }).as('getGoogleProvider')
  
  cy.intercept('POST', '**/api/auth/signin/google', {
    statusCode: 200,
    body: { url: 'http://localhost:3000/auth/callback/google' }
  }).as('googleSignin')
})

