const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('defra-hapi-handlers')
const TestHelper = require('../../../../test-helper')

class Model {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class DeclarationHandlers extends require('./declaration-handlers') {
  get Model () {
    return Model
  }

  get fieldname () {
    return 'testField'
  }

  get declaration () {
    return 'testDeclaration'
  }

  get description () {
    return 'testDescription'
  }

  get hint () {
    return 'hint'
  }

  async reference (request) {
    return {
      label: 'first-choice',
      shortName: 'first',
      testDeclaration: 'first declaration',
      hint: 'first choice hint'
    }
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new DeclarationHandlers()

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

  lab.test('handleGet builds view data as expected when the declaration has been checked and the description has been entered previously', async ({ context }) => {
    const { request, handlers, sandbox } = context

    sandbox.stub(DeclarationHandlers.prototype, 'Model').get(() => {
      return { get: () => { return { testField: 'first', testDeclaration: true, testDescription: 'my description' } } }
    })

    await handlers.handleGet(request)

    Code.expect(handlers.viewData).to.equal({
      declaration: 'testDeclaration',
      description: 'my description',
      declarationLabel: 'I declare first declaration',
      declarationChecked: true,
      descriptionLabel: 'Explain how you know first declaration'
    })
  })

  lab.test('handlePost sets model data correctly', async ({ context }) => {
    const { request, handlers } = context
    request.payload = { declaration: true, description: 'first description' }
    const { description: testDescription, declaration: testDeclaration } = request.payload
    await handlers.handlePost(request)
    Code.expect(Model.get(request)).to.equal({ testDeclaration, testDescription })
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    await handlers.Model.set(request, { testField: 'first' })
    const { error } = handlers.validate({}, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({
      declaration: { text: 'Select if you declare first declaration', href: '#declaration' },
      description: { text: 'Enter an explanation', href: '#description' }
    })
  })
})
