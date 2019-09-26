const { Item } = require('../../lib/cache')

class ConfirmPhotographHandlers extends require('../common/handlers') {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { photos = [] } = await Item.get(request) || {}
    const filename = photos.length ? photos[photos.length - 1].filename : {}

    this.viewData = {
      photoUrl: `/photos/${filename}`
    }
    return super.handleGet(request, h, errors)
  }
}

const handlers = new ConfirmPhotographHandlers()

module.exports = handlers.routes({
  path: '/check-photograph',
  app: {
    pageHeading: 'This is your photo',
    view: 'item/check-photograph',
    nextPath: '/item-description'
  }
})
