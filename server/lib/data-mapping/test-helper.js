const sinon = require('sinon')

const { logger } = require('defra-logging-facade')
const { Cache, utils } = require('../hapi-utils/index')
const SyncRegistration = require('./source/sync-registration')

// Suppress MaxListenersExceededWarning within tests
require('events').EventEmitter.defaultMaxListeners = Infinity

module.exports = class TestHelper {
  constructor (lab, testFile, options) {
    const { stubCallback, stubCache = true } = options || {}

    lab.beforeEach(async ({ context }) => {
      // Create a sinon sandbox to stub methods
      context.sandbox = sinon.createSandbox()

      // Stub common methods
      TestHelper.stubCommon(context)

      // Stub any methods specific to the test
      if (stubCallback) {
        stubCallback({ context })
      }

      if (stubCache) {
        TestHelper.stubCache(context)
      }
    })

    lab.afterEach(async ({ context }) => {
      const { sandbox, server } = context
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()

      // Stop the server
      return server.stop()
    })
  }

  static stubCommon (context) {
    const { sandbox, skip = {} } = context
    sandbox.stub(logger, 'debug').value(() => undefined)
    sandbox.stub(logger, 'info').value(() => undefined)
    sandbox.stub(logger, 'warn').value(() => undefined)
    sandbox.stub(logger, 'error').value(() => undefined)
    sandbox.stub(logger, 'serverError').value(() => undefined)
    if (!skip.syncRegistration) {
      sandbox.stub(SyncRegistration.prototype, 'save').value((data) => data)
      sandbox.stub(SyncRegistration.prototype, 'restore').value(() => {})
    }
  }

  static __cache (context) {
    if (!context.request) {
      context.request = {}
    }

    const { request } = context

    if (!request.app) {
      request.app = {}
    }

    const { app } = request
    if (!app.cache) {
      app.cache = {}
    }
    return app.cache
  }

  static getCache (context, key) {
    return key === undefined ? this.__cache(context) : this.__cache(context)[key]
  }

  static setCache (context, key, data) {
    this.__cache(context)[key] = data
    return data
  }

  static clearCache (context) {
    const cache = this.__cache(context)
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
  }

  static stubCache (context) {
    const { sandbox } = context

    sandbox.stub(Cache, 'get').value(async (request, key) => {
      const contextData = utils.getNestedVal(context, `request.app.cache.${key}`)
      const requestData = utils.getNestedVal(request, `app.cache.${key}`)
      if (!contextData && !requestData) {
        return undefined
      }
      const data = Object.assign({}, contextData || {}, requestData || {})
      // Set if not empty
      if (Object.keys(data).length) {
        TestHelper.setCache(context, key, data)
        TestHelper.setCache({ request }, key, data)
      }
      return data
    })

    sandbox.stub(Cache, 'set').value(async (request, key, data) => {
      TestHelper.setCache(context, key, data)
      TestHelper.setCache({ request }, key, data)
      return data
    })

    sandbox.stub(Cache, 'clear').value(() => {
      TestHelper.clearCache(context)
    })
  }

  static getFile (filename) {
    return filename.substring(__dirname.length)
  }
}
