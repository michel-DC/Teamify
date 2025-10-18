describe('Google Authentication Tests', () => {
  beforeEach(() => {
    cy.logout()
    cy.mockGoogleAuth()
  })

  it('should redirect to Google OAuth for login', () => {
    cy.visit('/auth/login')
    cy.get('button').contains('Continuer avec Google').click()
    
    cy.url().should('include', 'accounts.google.com')
  })

  it('should redirect to Google OAuth for registration', () => {
    cy.visit('/auth/register')
    cy.get('button').contains('Continuer avec Google').click()
    
    cy.url().should('include', 'accounts.google.com')
  })

  it('should handle Google OAuth callback for new user', () => {
    cy.intercept('GET', '**/api/auth/callback/google*', {
      statusCode: 200,
      body: {
        user: {
          id: 'google_user_123',
          name: 'Google Test User',
          email: 'google.test@example.com',
          image: 'https://lh3.googleusercontent.com/a/default-user'
        }
      }
    }).as('googleCallback')

    cy.visit('/auth/callback/google?code=test_code')
    cy.wait('@googleCallback')
    
    cy.url().should('include', '/dashboard')
  })

  it('should handle Google OAuth callback for existing user', () => {
    const existingUser = {
      name: 'Existing Google User',
      email: 'existing.google@example.com',
      password: 'Password123!'
    }

    cy.request('POST', '/api/auth/register', existingUser)

    cy.intercept('GET', '**/api/auth/callback/google*', {
      statusCode: 200,
      body: {
        user: {
          id: 'google_user_456',
          name: 'Existing Google User',
          email: 'existing.google@example.com',
          image: 'https://lh3.googleusercontent.com/a/default-user'
        }
      }
    }).as('googleCallback')

    cy.visit('/auth/callback/google?code=test_code')
    cy.wait('@googleCallback')
    
    cy.url().should('include', '/dashboard')
  })

  it('should store Google user data correctly', () => {
    const googleUserData = {
      id: 'google_user_789',
      name: 'Google Test User',
      email: 'google.test@example.com',
      image: 'https://lh3.googleusercontent.com/a/default-user'
    }

    cy.intercept('GET', '**/api/auth/callback/google*', {
      statusCode: 200,
      body: { user: googleUserData }
    }).as('googleCallback')

    cy.visit('/auth/callback/google?code=test_code')
    cy.wait('@googleCallback')
    
    cy.window().then((win) => {
      const userData = win.localStorage.getItem('user')
      expect(userData).to.not.be.null
      const parsedUser = JSON.parse(userData)
      expect(parsedUser.email).to.equal(googleUserData.email)
      expect(parsedUser.name).to.equal(googleUserData.name)
      expect(parsedUser.image).to.equal(googleUserData.image)
    })
  })

  it('should handle Google OAuth error', () => {
    cy.intercept('GET', '**/api/auth/callback/google*', {
      statusCode: 400,
      body: { error: 'OAuth error' }
    }).as('googleError')

    cy.visit('/auth/callback/google?error=access_denied')
    cy.wait('@googleError')
    
    cy.url().should('include', '/auth/login')
    cy.get('p.text-destructive').should('be.visible')
    cy.get('p.text-destructive').should('contain', 'Authentication failed')
  })

  it('should redirect to dashboard after successful Google authentication', () => {
    cy.intercept('GET', '**/api/auth/callback/google*', {
      statusCode: 200,
      body: {
        user: {
          id: 'google_user_999',
          name: 'Google Success User',
          email: 'google.success@example.com',
          image: 'https://lh3.googleusercontent.com/a/default-user'
        }
      }
    }).as('googleSuccess')

    cy.visit('/auth/callback/google?code=success_code')
    cy.wait('@googleSuccess')
    
    cy.url().should('include', '/dashboard')
  })
})
