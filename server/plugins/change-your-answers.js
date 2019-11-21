const { Cache } = require('ivory-shared')
const { Registration } = require('ivory-data-mapping').cache
const { changeYourAnswers, routeFlow } = require('ivory-common-modules').plugins
let flow

module.exports = {
  plugin: changeYourAnswers,
  options: {
    async validData (request) {
      const { validForPayment } = await Registration.get(request) || {}
      return validForPayment
    },
    async ignoreRoute ({ route }) {
      const { tags = [] } = route.settings
      return (tags.includes('always'))
    },
    get checkYourAnswersPath () {
      flow = flow || routeFlow.flow()
      return flow['check-your-answers'].path
    },
    async setChanging (request, flag) {
      return Cache.set(request, 'Changing', flag)
    },
    async isChanging (request) {
      return Cache.get(request, 'Changing')
    }
  }
}
