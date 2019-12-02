const { Item } = require('ivory-data-mapping').cache

class ConfirmPhotographHandlers extends require('defra-hapi-modules').photos.check.handlers {
  get Item () {
    return Item
  }
}

module.exports = ConfirmPhotographHandlers
