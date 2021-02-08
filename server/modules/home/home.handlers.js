const { Registration, Cache } = require('ivory-data-mapping').cache

class HomeHandlers extends require('../../lib/handlers/handlers') {
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

module.exports = HomeHandlers
