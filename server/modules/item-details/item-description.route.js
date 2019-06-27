const path = '/item-description'

module.exports = [{
  method: 'GET',
  path: path,
  handler: function (request, h) {
    return h.view(`item-details${path}`, {
      viewData: {
        itemDescription: request.yar.get('item-description')
      }
    })
  }

}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    request.yar.set('item-description', request.payload.itemDescription)

    return h.redirect('/check-your-answers')
  }
}]
