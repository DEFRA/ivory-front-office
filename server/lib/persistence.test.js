const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const Persistence = require('./persistence')
const config = require('../config')
const wreck = require('@hapi/wreck')

const path = '/path'

lab.experiment(TestHelper.getFile(__filename), () => {
  const saveResponse = { saved: true }
  let sandbox
  let requestArgs
  let requestMethod

  lab.beforeEach(() => {
    requestMethod = async (...args) => { requestArgs = args }

    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
    sandbox.stub(config, 'serviceApiEnabled').value(true)
    sandbox.stub(wreck, 'request').value(async (...args) => requestMethod(...args))
    sandbox.stub(wreck, 'read').value(async () => saveResponse)
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('save when api is enabled', async () => {
    const data = { hasData: true }
    const persistence = new Persistence({ path })
    const result = await persistence.save(data)
    Code.expect(result).to.equal(saveResponse)

    // Now check request was called with the correct arguments
    const [method, uri, { payload }] = requestArgs
    Code.expect(method).to.equal('POST')
    Code.expect(uri).to.endWith(path)
    Code.expect(JSON.parse(payload).hasData).to.equal(true)
  })

  lab.test('save when api is enabled and data contains an id', async () => {
    const data = { id: '59e06f54-e1ea-4cc3-a373-69db89174dfc', hasData: true }
    const persistence = new Persistence({ path })
    const result = await persistence.save(data)
    Code.expect(result).to.equal(saveResponse)

    // Now check request was called with the correct arguments
    const [method, uri, { payload }] = requestArgs
    Code.expect(method).to.equal('PATCH')
    Code.expect(uri).to.endWith(`${path}/${data.id}`)
    Code.expect(JSON.parse(payload).hasData).to.equal(true)
  })

  lab.test('save when api is disabled', async () => {
    sandbox.stub(config, 'serviceApiEnabled').value(false)
    const data = { hasData: true }
    const persistence = new Persistence({ path })
    const result = await persistence.save(data)
    Code.expect(result.hasData).to.equal(true)
  })

  lab.test('save when request throws an error', async () => {
    const data = { hasSomeData: true }

    // Override stubbed request method
    const testError = new Error('test error')
    requestMethod = () => {
      throw testError
    }

    const persistence = new Persistence({ path })
    let error
    try {
      await persistence.save(data)
    } catch (err) {
      error = err
    }
    Code.expect(error).to.equal(testError)
  })
})
