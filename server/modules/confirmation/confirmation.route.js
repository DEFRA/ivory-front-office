const { Registration } = require('../../lib/cache')

class ConfirmationHandlers extends require('ivory-common-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { registrationNumber } = await Registration.get(request) || {}
    this.viewData = { registrationNumber }
    return super.handleGet(request, h, errors)
  }
}

const handlers = new ConfirmationHandlers()

module.exports = handlers.routes({
  path: '/confirmation',
  app: {
    pageHeading: 'Registration complete',
    view: 'confirmation/confirmation',
    tags: ['submitted']
  }
})
