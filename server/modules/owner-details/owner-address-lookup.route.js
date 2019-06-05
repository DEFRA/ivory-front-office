const path = '/owner-address-lookup'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.view('owner-details/owner-address-lookup', {
      session: request.state.session
    })
  }
}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    // Set input in session cookie
    request.state.session.ownerAddressNameNumberLookup = request.payload.ownerAddressNameNumberLookup
    request.state.session.ownerAddressPostcode = request.payload.ownerAddressPostcode
    h.state('session', request.state.session)

    return h.redirect('/item-description')
  }
}]
