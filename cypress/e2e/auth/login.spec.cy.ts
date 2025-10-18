describe('Login Tests', () => {
  beforeEach(() => {
    cy.logout()
  })

  it('should login with valid credentials', () => {
    const user = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      passwordHash: 'TestPassword123!'
    }

    cy.request('POST', '/api/auth/register', user)
    
    cy.visit('/auth/login')
    cy.get('#email').type(user.email)
    cy.get('#password').type('TestPassword123!')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
  })

  it('should show error with invalid email', () => {
    cy.visit('/auth/login')
    cy.get('#email').type('invalid@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type="submit"]').click()
    
    cy.get('p.text-destructive').should('be.visible')
    cy.get('p.text-destructive').should('contain', 'Identifiants invalides')
  })

  it('should show error with invalid password', () => {
    const user = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      passwordHash: 'TestPassword123!'
    }

    cy.request('POST', '/api/auth/register', user)
    
    cy.visit('/auth/login')
    cy.get('#email').type(user.email)
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.get('p.text-destructive').should('be.visible')
    cy.get('p.text-destructive').should('contain', 'Identifiants invalides')
  })

  it('should show validation errors for empty fields', () => {
    cy.visit('/auth/login')
    cy.get('button[type="submit"]').click()
    
    cy.get('#email:invalid').should('exist')
    cy.get('#password:invalid').should('exist')
  })

  it('should redirect to dashboard after successful login', () => {
    const user = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      passwordHash: 'TestPassword123!'
    }

    cy.request('POST', '/api/auth/register', user)
    
    cy.login(user.email, 'TestPassword123!')
    cy.url().should('include', '/dashboard')
  })
})
