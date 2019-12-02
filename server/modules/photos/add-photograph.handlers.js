const { Item } = require('ivory-data-mapping').cache

class AddPhotographsHandlers extends require('defra-hapi-modules').photos.add.handlers {
  get Item () {
    return Item
  }
}

module.exports = AddPhotographsHandlers
