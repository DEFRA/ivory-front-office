const { Registration } = require('../../lib/data-mapping/index').cache

class RegistrationDocumentHandlers extends require('../../lib/handlers/handlers') {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { registrationNumber } = await Registration.get(request) || {}
    this.viewData = { registrationNumber }
    return super.handleGet(request, h, errors)
  }
}

module.exports = RegistrationDocumentHandlers
