const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const { setNestedVal } = require('./utils')
const { createError } = require('./joi-utilities')

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Stub methods
    context.sandbox = sinon.createSandbox()
    context.request = {}
    const { sandbox } = context
    TestHelper.stubCommon(sandbox)
  })

  lab.afterEach(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('createError', () => {
    lab.test('successfully mixes a class with a couple of mixin objects', async ({ context }) => {
      const { request } = context
      const defaultMessage = 'Test Message'
      setNestedVal(request, 'response.message', defaultMessage)
      const field = 'my-field'
      const code = 'test-error'
      const error = createError(request, field, code)

      Code.expect(error.name).to.equal('ValidationError')
      Code.expect(error.message).to.equal(`"${field}" ${defaultMessage}`)

      const { message, path, type } = error.details[0]

      Code.expect(message).to.equal(`"${field}" ${defaultMessage}`)
      Code.expect(type).to.equal(code)
      Code.expect(path).to.equal([field])
    })
  })
})
