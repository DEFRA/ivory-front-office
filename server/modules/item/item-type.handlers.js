const { Item } = require('ivory-data-mapping').cache

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

  async itemTypeSelected (request) {
    const item = await Item.get(request)
    switch (item.itemType) {
      case 'apply-for-an-rmi-certificate':
      case 'apply-to-register-to-sell-an-item-to-a-museum': return item.itemType
      default: return item.photos && item.photos.length ? 'other-has-photos' : 'other-has-no-photos'
    }
  }

  get divider () {
    return 'or'
  }

  get description () {
    return 'If the item isn\'t any of these types, you won\'t be able to sell it or hire it out.'
  }

  get guidanceLink () {
    return { href: '' }
  }
}

module.exports = ItemTypeHandlers
