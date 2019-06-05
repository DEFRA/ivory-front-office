const path = '/check-your-answers'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.view('core/check-your-answers', {
      session: request.state.session
    })
  }

},{
  method: 'POST',
  path: path,
  handler: function (request, h) {
    console.log(`${request.method} ${request.route.path}`)

    return h.redirect('#')
  }
}]
