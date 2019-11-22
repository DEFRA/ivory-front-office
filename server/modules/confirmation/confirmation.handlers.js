const { Registration } = require('ivory-data-mapping').cache

class ConfirmationHandlers extends require('defra-hapi-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { registrationNumber, confirmationSent } = await Registration.get(request) || {}
    this.viewData = { registrationNumber, confirmationSent }
    return super.handleGet(request, h, errors)
  }
}

module.exports = ConfirmationHandlers
