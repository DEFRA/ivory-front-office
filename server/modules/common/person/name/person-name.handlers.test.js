const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('../../../../lib/handlers/handlers')
const TestHelper = require('../../../../../test-helper')

class Person {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class NameHandlers extends require('./person-name.handlers') {
  get Person () {
    return Person
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new NameHandlers()

    handlers.viewData = { example: 'view-data' }

    const view = (name, data) => {
      // returns view data for checking
      return { [name]: data }
    }

    const redirect = (nextPath) => {
      // returns redirect data for checking
      return nextPath
    }

    const h = { view, redirect }
    const request = {}

    Object.assign(context, { handlers, request, h, view })
  })

  lab.afterEach(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('handleGet builds view data as expected when full name has been entered previously', async ({ context }) => {
    const { request, handlers, sandbox } = context

    // Make sure Person has the 'full-name' value set to My Name
    sandbox.stub(NameHandlers.prototype, 'Person').get(() => {
      return { get: () => { return { fullName: 'My Name' } } }
    })

    await handlers.handleGet(request)

    Code.expect(handlers.viewData).to.equal({
      'full-name': 'My Name',
      'full-name-label': 'Enter your full name'
    })
  })

  lab.test('handlePost sets Person data correctly', async ({ context }) => {
    const { request, handlers } = context
    const expectedData = { fullName: 'My Name' }
    request.payload = { 'full-name': 'My Name' }
    await handlers.handlePost(request)
    Code.expect(Person.get(request)).to.equal(expectedData)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({ 'full-name': '' }, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({ 'full-name': { text: 'Enter your full name', href: '#full-name' } })
  })
})
