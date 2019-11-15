const { Cache } = require('ivory-shared')
const { Registration } = require('ivory-data-mapping').cache
const { flow } = require('../flow')
const { changeYourAnswers } = require('ivory-common-modules').plugins

module.exports = {
  options: {
    validData: async (request) => {
      const { validForPayment } = await Registration.get(request) || {}
      return validForPayment
    },
    ignoreRoute: async ({ route }) => {
      const { tags = [] } = route.settings
      return (tags.includes('always'))
    },
    checkYourAnswersPath: flow['check-your-answers'].path,
    setChanging: async (request, flag) => Cache.set(request, 'Changing', flag),
    isChanging: async (request) => Cache.get(request, 'Changing')
  },
  plugin: {
    name: 'change-your-answers',
    register: changeYourAnswers
  }
}
