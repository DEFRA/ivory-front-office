const { Registration } = require('../../lib/cache')
const config = require('../../config')
const { referenceData } = config

class DealingIntentHandlers extends require('ivory-common-modules').option.single.handlers {
  get Model () {
    return Registration
  }

  get fieldname () {
    return 'dealingIntent'
  }

  get selectError () {
    return 'Select what you plan to do with the item'
  }
}

const handlers = new DealingIntentHandlers({ referenceData })

module.exports = handlers.routes({
  path: '/dealing-intent',
  app: {
    pageHeading: 'What do you plan to do with the item?',
    view: 'common/select-one-option',
    nextPath: '/check-your-answers',
    isQuestionPage: true
  }
})
