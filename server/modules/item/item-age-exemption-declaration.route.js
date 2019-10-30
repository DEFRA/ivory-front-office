const { Item } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class ItemAgeExemptionDeclarationHandlers extends require('../common/declaration-handlers') {
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

const routes = getRoutes.bind(handlers)('item-age-exemption-declaration')

module.exports = handlers.routes(routes)
