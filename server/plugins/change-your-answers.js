const { Cache } = require('defra-hapi-utils')
const { Registration } = require('ivory-data-mapping').cache
const changeYourAnswers = require('defra-hapi-change-answers')
let checkYourAnswersRoute

module.exports = {
  plugin: changeYourAnswers,
  options: {
    async init (server) {
      const { flow } = server.app
      checkYourAnswersRoute = await flow('check-your-answers')
    },

    async validData (request) {
      const { validForPayment } = await Registration.get(request) || {}
      return validForPayment
    },

    async ignoreRoute ({ route }) {
      const { tags = [] } = route.settings
      return (tags.includes('always'))
    },

    get checkYourAnswersPath () {
      return checkYourAnswersRoute.path
    },

    async setChanging (request, flag) {
      return Cache.set(request, 'Changing', flag)
    },

    async isChanging (request) {
      return Cache.get(request, 'Changing')
    }
  }
}
