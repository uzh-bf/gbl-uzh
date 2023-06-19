function login(cy) {
  cy.session('cypress@gbl.uzh.ch', () => {
    cy.visit('http://localhost:3000/admin/login')
    cy.findByText('Sign in').click()
    cy.findByText('Sign in with Auth0').click()

    cy.origin('https://uzh-bf-dev.eu.auth0.com', () => {
      cy.get('input[name="username"]').type('cypress@gbl.uzh.ch')
      cy.get('input[name="password"]').type('testing2023!')
      cy.get('form[data-form-primary="true"]').submit()
    })
  })

  cy.visit('http://localhost:3000/admin/games')
}

function joinAsTeam(cy, joinLink) {
  cy.session(joinLink, () => {
    cy.visit(joinLink)
  })

  cy.visit('http://localhost:3000/play/welcome')
}

function createGame(cy, name = undefined) {
  const gameName = name ?? `Game ${Math.round(Math.random() * 1000000)}`
  cy.get('input[data-cy="game-name"]').type(gameName)
  cy.get('input[data-cy="game-player-count"]').clear().type('2')
  cy.get('button[data-cy="create-game"]').click()
  return gameName
}

function addPeriod(cy, name) {
  cy.get('button[data-cy="add-period"]').click()
  cy.get('input[data-cy="period-name"]').clear().type(name)
  cy.get('button').contains('Submit').click()
}

function addSegment(cy) {
  cy.get('button[data-cy="add-segment"]').click()
  cy.get('button').contains('Submit').click()
}

describe('template spec', () => {
  it('passes', () => {
    login(cy)

    const gameName = createGame(cy)
    cy.get('a').contains(gameName).click()

    addPeriod(cy, 'Period 1')
    addSegment(cy)
    addSegment(cy)

    addPeriod(cy, 'Period 2')
    addSegment(cy)
    addSegment(cy)

    cy.get('div[data-cy="player-0"] a')
      .then((el) => {
        return `http://localhost:3000${el.attr('href')}`
      })
      .then((href) => {
        joinAsTeam(cy, href)
      })

    login(cy)
    cy.get('a').contains(gameName).click()

    cy.get('div[data-cy="player-1"] a')
      .then((el) => {
        return `http://localhost:3000${el.attr('href')}`
      })
      .then((href) => {
        joinAsTeam(cy, href)
      })
  })
})
