const sinon = require('sinon')
const Code = require('@hapi/code')
const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const Handlers = require('./server/modules/common/handlers')
const dotenv = require('dotenv')
const config = require('./server/config')
const { logger } = require('defra-logging-facade')

// Suppress MaxListenersExceededWarning within tests
require('events').EventEmitter.defaultMaxListeners = Infinity

module.exports = class TestHelper {
  constructor (lab, options) {
    const { stubCallback, stubCache = true } = options || {}

    lab.beforeEach(async () => {
      // Add env variables
      process.env.LOG_LEVEL = 'error'

      this._cache = {}

      // Create a sinon sandbox to stub methods
      this._sandbox = sinon.createSandbox()

      // Stub common methods
      TestHelper.stubCommon(this._sandbox)

      // Stub methods
      if (stubCache) {
        this._stubCache()
      }

      // Stub any methods specific to the test
      if (stubCallback) {
        stubCallback(this._sandbox)
      }

      this._server = await require('./server')()
    })

    lab.afterEach(async () => {
      // Restore the sandbox to make sure the stubs are removed correctly
      this._sandbox.restore()

      // Stop the server
      await this._server.stop()

      // Remove env variables
      delete process.env.LOG_LEVEL
    })
  }

  static stubCommon (sandbox) {
    sandbox.stub(dotenv, 'config').value(() => {})
    sandbox.stub(config, 'serviceName').value('Service name')
    sandbox.stub(config, 'addressLookUpEnabled').value(false)
    sandbox.stub(config, 'airbrakeEnabled').value(false)
    sandbox.stub(config, 'redisEnabled').value(false)
    sandbox.stub(config, 'serviceApiEnabled').value(false)
    sandbox.stub(logger, 'debug').value(() => undefined)
    sandbox.stub(logger, 'warn').value(() => undefined)
    sandbox.stub(logger, 'error').value(() => undefined)
    sandbox.stub(config, 'logLevel').value('error')
  }

  _stubCache () {
    this._sandbox.stub(Handlers.prototype, 'getCache').value((request, key) => {
      if (typeof key === 'string') {
        return this._cache[key]
      }
      return key.map((key) => this._cache[key])
    })
    this._sandbox.stub(Handlers.prototype, 'setCache').value((request, key, val) => { this._cache[key] = val })
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

  errorSummarySelector (field) {
    return `.govuk-error-summary .govuk-list a[href="#${field}"]`
  }

  errorMessageSelector (field) {
    return `#${field}-error`
  }

  async expectValidationErrors (request, errors) {
    const response = await this.server.inject(request)
    Code.expect(response.statusCode).to.equal(400)
    const $ = this.getDomParser(response.payload)

    errors.forEach(({ field, message }) => {
      Code.expect($(this.errorSummarySelector(field)).text()).to.equal(message)
      Code.expect($(this.errorMessageSelector(field)).text()).to.include(message)
    })
  }

  async expectRedirection (request, nextPath) {
    const response = await this.server.inject(request)

    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers['location']).to.equal(nextPath)
  }

  static getFile (filename) {
    return filename.substring(__dirname.length)
  }
}
