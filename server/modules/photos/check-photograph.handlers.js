const { Item } = require('ivory-data-mapping').cache

class ConfirmPhotographHandlers extends require('defra-hapi-handlers') {
  get Item () {
    return Item
  }

  get fieldname () {
    return 'photograph'
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { photos = [] } = await this.Item.get(request) || {}
    const photo = photos.length ? photos[photos.length - 1] : {}
    const { filename } = photo

    this.viewData = {
      photoUrl: `/photos/medium/${filename}`
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const item = await this.Item.get(request) || {}
    const { photos } = item

    if (photos && photos.length) {
      const photo = photos[photos.length - 1]
      photo.confirmed = true
    }

    await this.Item.set(request, item)

    return super.handlePost(request, h)
  }
}

module.exports = ConfirmPhotographHandlers
