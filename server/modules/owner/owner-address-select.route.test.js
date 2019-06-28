const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('../../modules/base/handlers')
const TestHelper = require('../../test-helper')

lab.experiment('Test Owner Address Select', () => {
  let cache
  let server
  let sandbox

  // Create server before the tests
  lab.before(async () => {
    server = await TestHelper.createServer()
  })

  lab.beforeEach(() => {
    cache = {}

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(Handlers.prototype, 'getCache').value(() => cache)
    sandbox.stub(Handlers.prototype, 'setCache').value((request, key, val) => {
      cache[key] = val
    })
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('GET /owner-address-select route works', async () => {
    const options = {
      method: 'GET',
      url: '/owner-address-select'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
})
