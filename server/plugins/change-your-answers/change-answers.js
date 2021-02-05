module.exports = async (server, options = {}) => {
  const { init } = options
  if (typeof init === 'function') {
    init(server)
  }

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

    const { method } = request

    if (method === 'post' && await isChanging(request)) {
      if (await validData(request)) {
        // Make sure Changing is switched off
        await setChanging(request, false)
        return h.redirect(checkYourAnswersPath).takeover()
      }
    }

    return h.continue
  })
}
