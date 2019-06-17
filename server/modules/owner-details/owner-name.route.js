const path = '/owner-name'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.view(`owner-details${path}`, {
      session: request.state.session
    })
  }

}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    // Set input in session cookie
    request.state.session.ownerName = request.payload.ownerName
    h.state('session', request.state.session)

    return h.redirect('/owner-address-find')
  }
}]
