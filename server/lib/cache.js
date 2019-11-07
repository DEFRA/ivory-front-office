const SyncRegistration = require('./sync-registration')
const syncRegistration = new SyncRegistration()
const Cache = require('ivory-shared').Cache

class ModelCache extends Cache {
  static async set (request, data, persistToDatabase = true) {
    await super.set(request, this.name, data)
    if (persistToDatabase) {
      return syncRegistration.save(request)
    }
  }

  static async get (request) {
    return super.get(request, this.name)
  }
}

class Registration extends ModelCache {}
class Owner extends ModelCache {}
class OwnerAddress extends ModelCache {}
class Agent extends ModelCache {}
class AgentAddress extends ModelCache {}
class Item extends ModelCache {}
class Payment extends ModelCache {}
class Photo extends ModelCache {}

const cache = {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item,
  Payment,
  Photo
}

const cacheClasses = Object.values(cache)

cache.restore = async (request, id) => {
  await Promise.all(cacheClasses.map((CacheClass) => CacheClass.set(request)))
  await syncRegistration.restore(request, id)

  return (await Registration.get(request) || {})
}

cache.save = async (request) => syncRegistration.save(request)

module.exports = cache
