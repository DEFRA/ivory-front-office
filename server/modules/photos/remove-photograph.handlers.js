const Boom = require('@hapi/boom')
const { Item } = require('ivory-data-mapping').cache
const { getPhotos } = require('../../plugins/photos/index')

class RemovePhotographHandlers extends require('../../lib/handlers/handlers') {
  get Item () {
    return Item
  }

  get fieldname () {
    return 'photograph'
  }

  async lastPhoto (request) {
    const item = await this.Item.get(request) || {}
    const { photos = [] } = item
    return photos.length === 0
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const id = request.params.id
    const cancelLink = await this.getNextPath(request)
    const { photos = [] } = await this.Item.get(request) || {}
    const photo = photos.find((photo) => photo.id === id)

    if (!photo) {
      return Boom.notFound()
    }

    const { filename } = photo

    this.viewData = {
      photoUrl: `/photos/medium/${filename}`,
      cancelLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const id = request.params.id
    const item = await this.Item.get(request) || {}
    const { photos = [] } = item
    const photo = photos.find((photo) => photo.id === id)

    if (photo) {
      // Remove the photo from the list
      item.photos = photos.filter((photo) => photo.id !== id)
      await this.Item.set(request, item)

      // Now delete the photo from AWS
      const awsPhotos = await getPhotos()
      await awsPhotos.delete(photo.filename)
    }

    return super.handlePost(request, h)
  }
}

module.exports = RemovePhotographHandlers
