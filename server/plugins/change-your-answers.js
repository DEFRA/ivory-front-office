const { Cache } = require('ivory-shared')
const { Registration } = require('../lib/cache')
const { flow } = require('../flow')

const options = {
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
}

function changeYourAnswers (server, options) {
  server.ext('onPostAuth', async (request, h) => {
    const { ignoreRoute, checkYourAnswersPath, setChanging } = options

    if (await ignoreRoute(request)) {
      return h.continue
    }

    const { method, route } = request

    if (method !== 'get') {
      return h.continue
    }

    if (route.path !== checkYourAnswersPath) {
      // Set status to checking if referred from check your answers
      const { referrer } = request.info
      const referrerPath = referrer ? (new URL(referrer)).pathname : ''
      if (referrerPath === checkYourAnswersPath) {
        await setChanging(request, true)
      }
    }

    return h.continue
  })

  server.ext('onPostHandler', async (request, h) => {
    const { ignoreRoute, checkYourAnswersPath, setChanging, isChanging, validData } = options

    if (await ignoreRoute(request)) {
      return h.continue
    }

    const { route, method } = request

    if (method === 'post' && await isChanging(request)) {
      if (route.path === checkYourAnswersPath) {
        // Make sure Changing is switched off
        await setChanging(request, false)
      } else {
        if (await validData(request)) {
          return h.redirect(checkYourAnswersPath).takeover()
        }
      }
    }

    return h.continue
  })
}

module.exports = {
  plugin: {
    name: 'change-your-answers',
    register: (server) => changeYourAnswers(server, options)
  }
}
