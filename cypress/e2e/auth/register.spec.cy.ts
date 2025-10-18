describe('Register Tests', () => {
  beforeEach(() => {
    cy.logout()
  })

  it('should register with valid data', () => {
    const user = {
      firstname: 'Test',
      lastname: 'User',
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    }

    cy.visit('/auth/register')
    cy.get('#firstname').type(user.firstname)
    cy.get('#lastname').type(user.lastname)
    cy.get('#email').type(user.email)
    cy.get('#password').type(user.password)
    cy.get('#confirmpassword').type(user.confirmPassword)
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/auth/login')
  })

  it('should show error for existing email', () => {
    const existingUser = {
      firstname: 'Existing',
      lastname: 'User',
      email: 'existing@example.com',
      passwordHash: 'ExistingPassword123!'
    }

    cy.request('POST', '/api/auth/register', existingUser)
    
    cy.visit('/auth/register')
    cy.get('#firstname').type('Another')
    cy.get('#lastname').type('User')
    cy.get('#email').type(existingUser.email)
    cy.get('#password').type('AnotherPassword123!')
    cy.get('#confirmpassword').type('AnotherPassword123!')
    cy.get('button[type="submit"]').click()
    
    cy.get('p.text-destructive').should('be.visible')
    cy.get('p.text-destructive').should('contain', 'Cet email est déjà utilisé')
  })

  it('should show validation errors for weak password', () => {
    cy.visit('/auth/register')
    cy.get('#firstname').type('Test')
    cy.get('#lastname').type('User')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('123')
    cy.get('#confirmpassword').type('123')
    cy.get('button[type="submit"]').click()
    
    cy.get('p.text-destructive').should('be.visible')
  })

  it('should show validation errors for invalid email', () => {
    cy.visit('/auth/register')
    cy.get('#firstname').type('Test')
    cy.get('#lastname').type('User')
    cy.get('#email').type('invalid-email')
    cy.get('#password').type('ValidPassword123!')
    cy.get('#confirmpassword').type('ValidPassword123!')
    cy.get('button[type="submit"]').click()
    
    cy.get('p.text-destructive').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.visit('/auth/register')
    cy.get('button[type="submit"]').click()
    
    cy.get('#firstname:invalid').should('exist')
    cy.get('#email:invalid').should('exist')
    cy.get('#password:invalid').should('exist')
  })

  it('should redirect to login after successful registration', () => {
    const user = {
      firstname: 'New',
      lastname: 'User',
      email: 'newuser@example.com',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    }

    cy.visit('/auth/register')
    cy.get('#firstname').type(user.firstname)
    cy.get('#lastname').type(user.lastname)
    cy.get('#email').type(user.email)
    cy.get('#password').type(user.password)
    cy.get('#confirmpassword').type(user.confirmPassword)
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/auth/login')
  })
})
