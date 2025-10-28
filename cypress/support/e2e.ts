import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      register(firstname: string, lastname: string, email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      mockGoogleAuth(): Chainable<void>
    }
  }
}
