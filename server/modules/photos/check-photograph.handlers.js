const { Item } = require('ivory-data-mapping').cache

class ConfirmPhotographHandlers extends require('defra-hapi-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { photos = [] } = await Item.get(request) || {}
    const filename = photos.length ? photos[photos.length - 1].filename : {}

    this.viewData = {
      photoUrl: `/photos/medium/${filename}`
    }
    return super.handleGet(request, h, errors)
  }
}

module.exports = ConfirmPhotographHandlers
