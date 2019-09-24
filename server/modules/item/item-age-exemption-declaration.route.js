const { Item } = require('../../lib/cache')

class ItemAgeExemptionDeclarationHandlers extends require('../common/declaration/declaration.handlers') {
  get Model () {
    return Item
  }

  get fieldname () {
    return 'itemType'
  }

  get declaration () {
    return 'ageExemptionDeclaration'
  }

  // Overrides parent class getPageHeading
  async getPageHeading (request) {
    const reference = await this.reference(request)
    return `Confirm ${reference[this.declaration]}`
  }

  get description () {
    return 'ageExemptionDescription'
  }
}

const handlers = new ItemAgeExemptionDeclarationHandlers()

module.exports = handlers.routes({
  path: '/item-age-exemption-declaration',
  app: {
    // pageHeading is derived in the getPageHeading method above
    view: 'common/declaration/declaration',
    nextPath: '/item-volume-exemption-declaration',
    isQuestionPage: true
  }
})
