const path = '/test'

module.exports = {
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.view('test.route.js', {
      session: request.state.session
    })
  }

}
