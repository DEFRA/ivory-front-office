const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('defra-hapi-handlers')
const TestHelper = require('../../../../../test-helper')

class Model {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class SingleOptionHandlers extends require('./single-option.handlers') {
  get Model () {
    return Model
  }

  get selectError () {
    return 'this is my test error message'
  }

  async onChange () {}

  get items () {
    return [
      {
        value: 'first',
        text: 'first-choice',
        hint: 'first choice hint',
        storedValue: 1
      }, {
        value: 'second',
        text: 'second-choice',
        hint: 'second choice hint',
        storedValue: 2
      }
    ]
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new SingleOptionHandlers()

    handlers.viewData = { example: 'view-data' }
    handlers.fieldname = 'testField'

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

  lab.test('handleGet builds view data as expected when first-choice is selected', async ({ context }) => {
    const { request, handlers, sandbox } = context

    // Make sure model has the testField value set to 1
    sandbox.stub(SingleOptionHandlers.prototype, 'Model').get(() => {
      return { get: () => { return { testField: 1 } } }
    })

    await handlers.handleGet(request)

    const { items } = handlers.viewData

    Code.expect(items).to.equal([
      {
        value: 'first',
        text: 'first-choice',
        hint: { text: 'first choice hint' },
        checked: true
      }, {
        value: 'second',
        text: 'second-choice',
        hint: { text: 'second choice hint' },
        checked: false
      }
    ])
  })

  lab.test('handlePost sets model data correctly', async ({ context }) => {
    const { request, handlers, sandbox } = context
    const expectedData = { testField: 1 }
    const spy = sandbox.spy(SingleOptionHandlers.prototype, 'onChange')
    request.payload = { testField: 'first' }
    await handlers.handlePost(request)
    Code.expect(Model.get(request)).to.equal(expectedData)
    Code.expect(spy.calledWith(expectedData)).to.equal(true)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({}, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({ testField: { text: handlers.selectError, href: '#testField' } })
  })
})
