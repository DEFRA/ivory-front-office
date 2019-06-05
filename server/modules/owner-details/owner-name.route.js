const path = '/owner-name'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.view('owner-details/owner-name', {
      session: request.state.session
    })
  }

}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    console.log('hi')
    console.log(request.payload)
    // Set input in session cookie
    request.state.session.ownerName = request.payload.ownerName
    console.log('hi2')
    console.log(request.state.session)
    h.state('session', request.state.session)

    return h.redirect('/owner-address-lookup')
  }
}]
