const { Item } = require('../../lib/cache')

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

module.exports = handlers.routes({
  path: '/item-volume-exemption-declaration',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/declaration',
    nextPath: '/who-owns-item',
    isQuestionPage: true
  }
})
