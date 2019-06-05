const path = '/start'

module.exports = {
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    // TODO: Should we remove the session cookie on the 'start' button?
    // Remove cookie when users 'Start now'.
    // h.unstate('session') // This didn't work

    // Create cookie (unless the user is returning and it still exists)
    let cookie = request.state.session
    if (!cookie) {
      cookie = { created: Date.now() }
      console.log(`New cookie created on ${cookie.created}`)
    } else {
      console.log(`Found existing cookie created on ${cookie.created}`)
    }
    h.state('session', cookie)

    return h.redirect('/owner-name')
  }
}
