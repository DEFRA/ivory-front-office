const { Registration } = require('../../lib/cache')
const { getRoutes } = require('../../flow')

class WhoOwnsHandlers extends require('ivory-common-modules').option.single.handlers {
  get Model () {
    return Registration
  }

  get fieldname () {
    return 'ownerType'
  }

  get selectError () {
    return 'Select if you own it or someone else owns it'
  }

  async isOwner (request) {
    const { ownerType } = await this.getData(request)
    return (ownerType === 'agent')
  }
}

const handlers = new WhoOwnsHandlers()

const routes = getRoutes.bind(handlers)('who-owns-item')

module.exports = handlers.routes(routes)
