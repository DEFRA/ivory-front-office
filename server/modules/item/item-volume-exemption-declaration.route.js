const { Item } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class ItemVolumeExemptionDeclarationHandlers extends require('ivory-common-modules').declaration.handlers {
  get Model () {
    return Item
  }

  get fieldname () {
    return 'itemType'
  }

  get declaration () {
    return 'volumeExemptionDeclaration'
  }

  async errorMessages (request) {
    const errorMessages = await super.errorMessages(request)
    const reference = await this.reference(request)
    const { shortName } = reference
    if (shortName !== 'portrait-miniature-pre-1918') {
      Object.entries(errorMessages.declaration).forEach(([type, message]) => {
        errorMessages.declaration[type] = `${message} by volume`
      })
    }
    return errorMessages
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const reference = await this.reference(request)
    return `Confirm ${reference[this.declaration]}`
  }

  // Overrides parent class getPageHeading
  getDeclarationLabel (reference) {
    const { shortName, volumeExemptionDeclaration } = reference
    if (shortName !== 'portrait-miniature-pre-1918') {
      return `I declare ${volumeExemptionDeclaration} by volume`
    }
    return `I declare ${volumeExemptionDeclaration}`
  }

  get description () {
    return 'volumeExemptionDescription'
  }
}

const handlers = new ItemVolumeExemptionDeclarationHandlers()

const routes = getRoutes.bind(handlers)('item-volume-exemption-declaration')

module.exports = handlers.routes(routes)
