module.exports = {
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('core/home')
  }
}
