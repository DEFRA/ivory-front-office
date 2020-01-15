const { Item } = require('ivory-data-mapping').cache
const config = require('../../config')

class ManagePhotographHandlers extends require('defra-hapi-handlers') {
  get Item () {
    return Item
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { flow } = request.server.app
    const removeRoute = await flow('remove-photograph')
    const addRoute = await flow('add-photograph')

    const { photos = [] } = await this.Item.get(request) || {}

    const photosSummaryList = photos.map(({ filename, originalFilename, id }, index) => {
      return {
        key: {
          classes: 'your-photos-key',
          text: `Photo ${index + 1}`
        },
        value: {
          classes: 'your-photos-value',
          html: `<img class="your-photos-img" src="/photos/medium/${filename}" alt="${originalFilename}"/>`
        },
        actions: {
          classes: 'your-photos-actions',
          items: [
            {
              attributes: {
                id: `remove-photo-${index + 1}`
              },
              href: removeRoute.path.replace('{id}', id),
              text: 'Remove',
              visuallyHiddenText: `Photo ${index + 1}`
            }
          ]
        }
      }
    })

    this.viewData = { photosSummaryList, maxPhotos: config.photoUploadMaxPhotos, addPhotoLink: addRoute.path }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const item = await this.Item.get(request) || {}
    const { photos = [] } = item

    item.photos = photos.map((photo) => {
      photo.confirmed = true
      return photo
    })

    await this.Item.set(request, item)

    return super.handlePost(request, h)
  }
}

module.exports = ManagePhotographHandlers
