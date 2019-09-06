class DealingIntentHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'dealingIntent'
  }

  get selectError () {
    return 'Select what you plan to do with the item'
  }
}

const handlers = new DealingIntentHandlers()

module.exports = handlers.routes({
  path: '/dealing-intent',
  app: {
    pageHeading: 'What do you plan to do with the item?',
    view: 'common/option/select-one-option',
    nextPath: '/check-your-answers',
    isQuestionPage: true
  }
})
