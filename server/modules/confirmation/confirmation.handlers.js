const { Registration } = require('../../lib/data-mapping/index').cache

class ConfirmationHandlers extends require('../../lib/handlers/handlers') {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { registrationNumber, confirmationSent } = await Registration.get(request) || {}
    this.viewData = { registrationNumber, confirmationSent }
    return super.handleGet(request, h, errors)
  }
}

module.exports = ConfirmationHandlers
