const { Cache } = require('ivory-shared')

class BaseCache {
  static async set (request, data, persistToDatabase = true) {
    await Cache.set(request, this.name, data)
    if (persistToDatabase) {
      // Only require when required to prevent require dependency loop
      const syncRegistration = require('./sync-registration')
      return syncRegistration.save(request)
    }
  }

  static async get (request) {
    return Cache.get(request, this.name)
  }
}

class Registration extends BaseCache {}
class Owner extends BaseCache {}
class OwnerAddress extends BaseCache {}
class Agent extends BaseCache {}
class AgentAddress extends BaseCache {}
class Item extends BaseCache {}
class Payment extends BaseCache {}
class Photo extends BaseCache {}

module.exports = {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item,
  Payment,
  Photo
}
