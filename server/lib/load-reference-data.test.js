const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const loadReferenceData = require('./load-reference-data')
const wreck = require('@hapi/wreck')

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  let requestArgs
  let requestMethod
  let group
  let choice

  lab.beforeEach(() => {
    // Stub request method
    requestArgs = []
    requestMethod = async (...args) => {
      requestArgs.push(args)
      return args
    }

    // Set data
    group = { id: '123', type: 'groupA' }
    choice = { groupId: '123' }

    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
    sandbox.stub(wreck, 'request').value((...args) => requestMethod(...args))
    sandbox.stub(wreck, 'read').value(async (...args) => {
      const [[method, uri]] = args
      if (uri.endsWith('/choices')) {
        return [choice]
      } else if (uri.endsWith('/groups')) {
        return [group]
      }
      throw new Error(`${method} ${uri} unexpected`)
    })
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('load data', async () => {
    const { groupA } = await loadReferenceData()
    Code.expect(groupA.id).to.equal(group.id)
    const [choiceA] = groupA.choices
    Code.expect(choiceA).to.equal(choice)
  })

  lab.test('load data when request throws an error', async () => {
    // Override stubbed request method
    const testError = new Error('test error')
    requestMethod = () => {
      throw testError
    }

    let error
    try {
      await loadReferenceData()
    } catch (err) {
      error = err
    }
    Code.expect(error).to.equal(testError)
  })
})
