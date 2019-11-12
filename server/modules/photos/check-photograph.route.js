const { Item } = require('ivory-data-mapping').cache
const { getRoutes } = require('../../flow')

class ConfirmPhotographHandlers extends require('ivory-common-modules').handlers {
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

const handlers = new ConfirmPhotographHandlers()

const routes = getRoutes.bind(handlers)('check-photograph')

module.exports = handlers.routes(routes)
