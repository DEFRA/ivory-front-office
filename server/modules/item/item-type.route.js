const { Item } = require('../../lib/cache')

class DealingIntentHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'itemType'
  }

  get selectError () {
    return 'Select what type of item you are registering'
  }

  async getData (request) {
    return await Item.get(request) || {}
  }

  async setData (request, item) {
    return Item.set(request, item)
  }

  async onChange (item) {
    // Make sure the exemptions are reset if the item type has changed
    item.ageExemptionDeclaration = null
    item.ageExemptionDescription = null
    item.volumeExemptionDeclaration = null
    item.volumeExemptionDescription = null
  }
}

const handlers = new DealingIntentHandlers()

module.exports = handlers.routes({
  path: '/item-type',
  app: {
    pageHeading: 'What type of item are you registering?',
    view: 'common/option/select-one-option',
    nextPath: '/add-photograph',
    isQuestionPage: true
  }
})
