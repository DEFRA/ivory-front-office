const SyncRegistration = require('./sync-registration')
const syncRegistration = new SyncRegistration()

const cache = {
  Cache: require('../../hapi-utils/index').Cache
}

// Note that this is a bit of a fudge because inheriting from cache.Cache allows tests to mock the Cache class in the front end.
class ModelCache extends cache.Cache {
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

Object.assign(cache, {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item,
  Payment,
  Photo
})

const cacheClasses = Object.values(cache)

cache.restore = async (request, id) => {
  await Promise.all(cacheClasses
    .filter((CacheClass) => CacheClass !== cache.Cache)
    .map((CacheClass) => CacheClass.set(request))
  )
  await syncRegistration.restore(request, id)

  return (await Registration.get(request) || {})
}

cache.save = async (request) => syncRegistration.save(request)

module.exports = cache
