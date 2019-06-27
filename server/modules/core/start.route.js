const path = '/start'

module.exports = {
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.redirect('/owner-name')
  }
}
