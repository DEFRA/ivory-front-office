const path = '/item-description'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.view(`item-details${path}`, {
      session: request.state.session
    })
  }

}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    // Set input in session cookie
    request.state.session.itemDescription = request.payload.itemDescription
    h.state('session', request.state.session)

    return h.redirect('/check-your-answers')
  }
}]
