const { Registration } = require('../../lib/data-mapping/index').cache

class WhoOwnsHandlers extends require('../common/option/single/single-option.handlers') {
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
    return (ownerType === 'i-own-it')
  }
}

module.exports = WhoOwnsHandlers
