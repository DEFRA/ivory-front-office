const { logger } = require('defra-logging-facade')
const path = '/start'

module.exports = {
  method: 'GET',
  path: path,
  handler: function (request, h) {
    // TODO: Should we remove the session cookie on the 'start' button?
    // Remove cookie when users 'Start now'.
    // h.unstate('session') // This didn't work

    // Create cookie (unless the user is returning and it still exists)
    let cookie = request.state.session
    if (!cookie) {
      cookie = { created: Date.now() }
      logger.debug(`New cookie created on ${cookie.created}`)
    } else {
      logger.debug(`Found existing cookie created on ${cookie.created}`)
    }
    h.state('session', cookie)

    return h.redirect('/owner-name')
  }
}
