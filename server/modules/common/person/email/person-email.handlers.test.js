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

class EmailHandlers extends require('./person-email.handlers') {
  get Person () {
    return Person
  }

  getEmailHint () {
    return 'email hint'
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new EmailHandlers()

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

  lab.test('handleGet builds view data as expected when email has been entered previously', async ({ context }) => {
    const { request, handlers, sandbox } = context

    // Make sure Person has the email value set to my.email@test.com
    sandbox.stub(EmailHandlers.prototype, 'Person').get(() => {
      return { get: () => { return { email: 'my.email@test.com' } } }
    })

    await handlers.handleGet(request)

    Code.expect(handlers.viewData).to.equal({ email: 'my.email@test.com', emailHint: 'email hint' })
  })

  lab.test('handlePost sets Person data correctly', async ({ context }) => {
    const { request, handlers } = context
    const expectedData = { email: 'my.email@test.com' }
    request.payload = { email: 'my.email@test.com' }
    await handlers.handlePost(request)
    Code.expect(Person.get(request)).to.equal(expectedData)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({ email: '' }, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({ email: { text: 'Enter an email address in the correct format, like name@example.com', href: '#email' } })
  })
})
