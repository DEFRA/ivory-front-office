const { Registration } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class ConfirmationHandlers extends require('ivory-common-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { registrationNumber, confirmationSent } = await Registration.get(request) || {}
    this.viewData = { registrationNumber, confirmationSent }
    return super.handleGet(request, h, errors)
  }
}

const handlers = new ConfirmationHandlers()

const routes = getRoutes.bind(handlers)('confirmation')

module.exports = handlers.routes(routes)
