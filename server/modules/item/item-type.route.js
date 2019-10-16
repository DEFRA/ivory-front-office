const { Item } = require('../../lib/cache')

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

module.exports = handlers.routes({
  path: '/item-type',
  app: {
    pageHeading: 'What type of item are you registering?',
    view: 'common/select-one-option',
    nextPath: '/add-photograph',
    isQuestionPage: true
  }
})
