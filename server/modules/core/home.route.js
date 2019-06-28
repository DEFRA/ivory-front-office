
module.exports = {
  method: 'GET',
  path: '/',
  handler: function (request, h) {
    return h.redirect('/owner-name')
  }
}
