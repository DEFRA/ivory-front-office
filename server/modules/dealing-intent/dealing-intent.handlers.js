const { Registration } = require('ivory-data-mapping').cache

class DealingIntentHandlers extends require('../common/option/single/single-option.handlers') {
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
