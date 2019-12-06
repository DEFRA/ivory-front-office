const { Item } = require('ivory-data-mapping').cache
const { getNestedVal } = require('defra-hapi-utils').utils

class ItemTypeHandlers extends require('../common/option/single/single-option.handlers') {
  get Model () {
    return Item
  }

  get fieldname () {
    return 'itemType'
  }

  get selectError () {
    return 'Select the type of item it is'
  }

  async hasPhotos (request) {
    const item = await Item.get(request)
    return !!getNestedVal(item, 'photos.length')
  }
}

module.exports = ItemTypeHandlers
