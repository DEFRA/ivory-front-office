class DealingIntentHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'itemType'
  }

  get selectError () {
    return 'Select what type of item you are registering'
  }
}

const handlers = new DealingIntentHandlers()

module.exports = handlers.routes({
  path: '/item-type',
  app: {
    pageHeading: 'What type of item are you registering?',
    view: 'common/option/select-one-option',
    nextPath: '/item-description',
    isQuestionPage: true
  }
})
