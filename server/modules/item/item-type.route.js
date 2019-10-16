const { Item } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class ItemTypeHandlers extends require('ivory-common-modules').option.single.handlers {
  get Model () {
    return Item
  }

  get fieldname () {
    return 'itemType'
  }

  get selectError () {
    return 'Select the type of item it is'
  }

  async onChange (item) {
    // Make sure the exemptions are reset if the item type has changed
    item.ageExemptionDeclaration = null
    item.ageExemptionDescription = null
    item.volumeExemptionDeclaration = null
    item.volumeExemptionDescription = null
  }
}

const handlers = new ItemTypeHandlers()

const routes = getRoutes.bind(handlers)('item-type')

module.exports = handlers.routes(routes)
