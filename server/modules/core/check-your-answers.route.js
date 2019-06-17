const path = '/check-your-answers'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.view(`core${path}`, {
      session: request.state.session
    })
  }

}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    return h.redirect('#')
  }
}]
