const path = '/test'

module.exports = {
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.view('test.route.js', {
      session: request.state.session
    })
  }

}
