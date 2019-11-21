const { Registration } = require('ivory-data-mapping').cache

class DealingIntentHandlers extends require('../common/single-option-handlers') {
  get Model () {
    return Registration
  }

  get fieldname () {
    return 'dealingIntent'
  }

  get selectError () {
    return 'Select if you want to sell or hire it'
  }
}

module.exports = DealingIntentHandlers
