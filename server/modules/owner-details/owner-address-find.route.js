const path = '/owner-address-find'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.view(`owner-details${path}`, {
      session: request.state.session
    })
  }
}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    // Set input in session cookie
    // request.state.session.ownerAddressNameNumberLookup = request.payload.ownerAddressNameNumberLookup
    request.state.session.ownerAddressPostcode = request.payload.ownerAddressPostcode
    h.state('session', request.state.session)

    let postcode = request.payload.ownerAddressPostcode
    postcode = postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces

    return h.redirect(`/owner-address-select?postcode=${postcode}`)
  }
}]
