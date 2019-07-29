const merge = require('lodash.merge')

module.exports = {
  // Usage: const val = getNestedVal(myObj, 'a.b.c')
  getNestedVal (nestedObj, path) {
    return path
      .split('.')
      .reduce((obj, key) => {
        return (obj && obj[key] !== 'undefined') ? obj[key] : undefined
      }, nestedObj)
  },

  async delay (timeout) {
    await new Promise((resolve) => setTimeout(resolve, timeout))
  },

  cloneAndMerge (...args) {
    const obj = {}
    merge(obj, ...args)
    Object.entries(obj).forEach(([prop, val]) => {
      if (val === undefined) {
        delete obj[prop]
      }
    })
    return obj
  },

  async getCache (request, key) {
    if (typeof key === 'string') {
      return request.yar.get(key) || {}
    }
    // Retrieve each item specified in the array of keys
    // usage: const [a, b, c] = await this.getCache(request, ['a', 'b', 'c'])
    return Promise.all(key.map(async (key) => {
      return this.getCache(request, key)
    }))
  },

  async setCache (request, key, val) {
    request.yar.set(key, val)
  }
}
