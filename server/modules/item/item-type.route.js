const { Item } = require('../../lib/cache')
const config = require('../../config')
const { referenceData } = config

class ItemTypeHandlers extends require('ivory-common-modules').option.single.handlers {
  get Model () {
    return Item
  }

  get fieldname () {
    return 'itemType'
  }

  get selectError () {
    return 'Select what type of item you are registering'
  }

  async onChange (item) {
    // Make sure the exemptions are reset if the item type has changed
    item.ageExemptionDeclaration = null
    item.ageExemptionDescription = null
    item.volumeExemptionDeclaration = null
    item.volumeExemptionDescription = null
  }
}

const handlers = new ItemTypeHandlers({ referenceData })

module.exports = handlers.routes({
  path: '/item-type',
  app: {
    pageHeading: 'What type of item are you registering?',
    view: 'common/select-one-option',
    nextPath: '/add-photograph',
    isQuestionPage: true
  }
})
