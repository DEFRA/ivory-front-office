const { Item } = require('../../lib/data-mapping/index').cache

class ItemAgeExemptionDeclarationHandlers extends require('../common/declaration/declaration-handlers') {
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

module.exports = ItemAgeExemptionDeclarationHandlers
