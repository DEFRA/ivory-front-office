const { Cache } = require('ivory-shared')

class BaseCache {
  static async set (request, data, persistence) {
    await Cache.set(request, this.name, data)
    if (persistence) {
      return persistence.save(request)
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

module.exports = {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item
}
