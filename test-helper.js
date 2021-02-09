const sinon = require('sinon')
const Code = require('@hapi/code')
const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const dotenv = require('dotenv')

// SET Environment variables before loading the config
process.env.SERVICE_NAME = 'Demo Service'
process.env.COOKIE_PASSWORD = '6eea0a1e5a8a4432810022b3d1d6054cf6716c3952bc5cbd71314397eaf0666bfa928ecc50232b49041299de6872643e6ea3f84b95b11fc78b1bbf44f648d92a'
process.env.ADDRESS_LOOKUP_ENABLED = false
process.env.REDIS_ENABLED = false
process.env.SERVICE_API_ENABLED = false
process.env.PAYMENT_ENABLED = false
process.env.AWS_S3_ENABLED = false
process.env.NOTIFY_ENABLED = false
process.env.LOG_LEVEL = 'error'
process.env.NODE_ENV = 'unit-test'
const config = require('./server/config')

const { logger } = require('defra-logging-facade')
const { utils } = require('./server/lib/hapi-utils/index')
const { SyncRegistration, cache } = require('./server/lib/data-mapping/index')
const { Flow } = require('./server/plugins/flow').plugin.test

// Suppress MaxListenersExceededWarning within tests
require('events').EventEmitter.defaultMaxListeners = Infinity

SyncRegistration.serviceApi = 'http://fake-service.com'

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
        // Make sure the registration is set in order for the tests to pass
        TestHelper.setCache(context, 'Registration', {})
      }

      // Stub createRoutes to add only the tested handlers derived from the test filename
      const handler = `${testFile.split('.')[0]}.handlers`
      const originalCreateRoutes = Flow.createRoutes
      context.sandbox.stub(Flow, 'createRoutes').value(async function (node, server, handlersDir) {
        if (handler.endsWith(node.handlers)) {
          return originalCreateRoutes.call(this, node, server, handlersDir)
        }
      })

      context.server = await require('./server')()
    })

    lab.afterEach(async ({ context }) => {
      const { sandbox, server } = context
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()

      // Stop the server
      return server.stop()
    })
  }

  static createRoutesHelper (...args) {
    return new TestHelper(...args)
  }

  getRequestTests ({ lab, pageHeading, url }, requestTestsCallback) {
    lab.experiment(`GET ${url}`, () => {
      lab.beforeEach(({ context }) => {
        const { request = {} } = context
        // just in case
        request.method = request.method || 'GET'
        request.url = request.url || url
        request.app = request.app || {}
        request.app.cache = request.app.cache || {}
        context.request = request
      })

      lab.test('page loads ok', async ({ context }) => {
        const { server } = context
        const response = await server.inject(context.request)
        Code.expect(response.statusCode).to.equal(200)
        Code.expect(response.headers['content-type']).to.include('text/html')
      })

      lab.test('page heading is correct', async ({ context }) => {
        const { server } = context
        const response = await server.inject(context.request)
        const $ = this.getDomParser(response.payload)

        Code.expect($('h1').text()).to.include(pageHeading)
      })

      if (requestTestsCallback) {
        requestTestsCallback()
      }
    })
  }

  postRequestTests ({ lab, pageHeading, url }, requestTestsCallback) {
    lab.experiment(`POST ${url}`, () => {
      lab.beforeEach(({ context }) => {
        const { request = {} } = context
        // just in case
        request.method = request.method || 'POST'
        request.url = request.url || url
        request.payload = request.payload || {}
        request.app = request.app || {}
        request.app.cache = request.app.cache || {}
        context.request = request
      })

      if (requestTestsCallback) {
        requestTestsCallback()
      }
    })
  }

  static stubCommon (context) {
    const { sandbox, skip = {} } = context
    sandbox.stub(dotenv, 'config').value(() => {})
    sandbox.stub(config, 'serviceName').value('Service name')
    sandbox.stub(logger, 'debug').value(() => undefined)
    sandbox.stub(logger, 'info').value(() => undefined)
    sandbox.stub(logger, 'warn').value(() => undefined)
    sandbox.stub(logger, 'error').value(() => undefined)
    sandbox.stub(logger, 'serverError').value(() => undefined)
    sandbox.stub(config, 'logLevel').value('error')
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

    sandbox.stub(cache.Cache, 'get').value(async (request, key) => {
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

    sandbox.stub(cache.Cache, 'set').value(async (request, key, data) => {
      TestHelper.setCache(context, key, data)
      TestHelper.setCache({ request }, key, data)
      return data
    })

    sandbox.stub(cache.Cache, 'clear').value(() => {
      TestHelper.clearCache(context)
    })
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
    return `a[href="#${field}"], a[href="#${field}-1"]`
  }

  errorMessageSelector (field) {
    return `#${field}-error`
  }

  async expectValidationErrors (context, errors) {
    const { request, server } = context
    const response = await server.inject(request)
    // Code.expect(response.statusCode).to.equal(400)
    const $ = this.getDomParser(response.payload)

    errors.forEach(({ field, message }) => {
      Code.expect($(this.errorSummarySelector(field)).text()).to.include(message)
      Code.expect($(this.errorMessageSelector(field)).text()).to.include(message)
    })
  }

  async expectRedirection (context, nextPath) {
    const { request, server } = context

    const response = await server.inject(request)

    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal(nextPath)
  }

  static getFile (filename) {
    return filename.substring(__dirname.length)
  }
}
