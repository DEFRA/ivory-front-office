const { Cache } = require('ivory-shared')
const { Registration } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class HomeHandlers extends require('ivory-common-modules').handlers {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)

    const registration = {
      status: 'draft'
    }
    await Registration.set(request, registration)

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

const handlers = new HomeHandlers()

const routes = getRoutes.bind(handlers)('home')

module.exports = handlers.routes(routes)
