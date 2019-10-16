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

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const reference = await this.reference(request)
    return `Confirm ${reference[this.declaration]}`
  }

  // Overrides parent class getPageHeading
  getDeclarationLabel (reference) {
    const { shortName, volumeExemptionDeclaration } = reference
    switch (shortName) {
      case 'pre-1947-less-than-10-percent':
      case 'musical-pre-1975-less-than-20-percent':
        return `I declare ${volumeExemptionDeclaration} by volume`
      case 'portrait-miniature-pre-1918':
        return `I declare ${volumeExemptionDeclaration}`
      default:
        throw new Error('Invalid volume exception declaration')
    }
  }

  get description () {
    return 'volumeExemptionDescription'
  }
}

const handlers = new ItemVolumeExemptionDeclarationHandlers()

const routes = getRoutes.bind(handlers)('item-volume-exemption-declaration')

module.exports = handlers.routes(routes)
