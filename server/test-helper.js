const sinon = require('sinon')
const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const Handlers = require('./modules/base/handlers')

// Suppress MaxListenersExceededWarning within tests
require('events').EventEmitter.defaultMaxListeners = Infinity

module.exports = class TestHelper {
  constructor (lab, stubCallback) {
    lab.beforeEach(async () => {
      // Add env variables
      process.env.ADDRESS_LOOKUP_ENABLED = false
      process.env.AIRBRAKE_ENABLED = false
      process.env.LOG_LEVEL = 'error'

      this._cache = {}

      // Create a sinon sandbox to stub methods
      this._sandbox = sinon.createSandbox()

      // Stub methods
      this._sandbox.stub(Handlers.prototype, 'getCache').value((request, key) => {
        return this._cache[key]
      })
      this._sandbox.stub(Handlers.prototype, 'setCache').value((request, key, val) => {
        this._cache[key] = val
      })

      // Stub any methods specific to the test
      if (stubCallback) {
        stubCallback(this._sandbox)
      }

      this._server = await require('../server')()
    })

    lab.afterEach(async () => {
      // Restore the sandbox to make sure the stubs are removed correctly
      this._sandbox.restore()

      // Stop the server
      await this._server.stop()

      // Remove env variables
      delete process.env.ADDRESS_LOOKUP_ENABLED
      delete process.env.AIRBRAKE_ENABLED
      delete process.env.LOG_LEVEL
    })
  }

  get server () {
    return this._server
  }

  get cache () {
    return this._cache
  }

  get sandbox () {
    return this._sandbox
  }

  getDomParser (payload) {
    return cheerio.load(htmlparser2
      .parseDOM(payload, {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true,
        decodeEntities: true
      })
    )
  }
}
