const ivoryShared = require('ivory-shared')

class BaseCache {
  static async set (request, data, persistToDatabase = true) {
    const { Cache } = ivoryShared
    await Cache.set(request, this.name, data)
    if (persistToDatabase) {
      // Only require when required to prevent require dependency loop
      const syncRegistration = require('./sync-registration')
      return syncRegistration.save(request)
    }
  }

  static async get (request) {
    const { Cache } = ivoryShared
    return Cache.get(request, this.name)
  }
}

module.exports = BaseCache
