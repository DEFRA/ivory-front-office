const { Registration } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class DealingIntentHandlers extends require('ivory-common-modules').option.single.handlers {
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

const handlers = new DealingIntentHandlers()

const routes = getRoutes.bind(handlers)('dealing-intent')

module.exports = handlers.routes(routes)
