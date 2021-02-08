const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const Persistence = require('./persistence')
const wreck = require('@hapi/wreck')

const path = 'https://test.persistence.com/path'

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  let requestArgs
  let requestMethod

  lab.beforeEach(() => {
    requestMethod = async (...args) => { requestArgs = args }

    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
    sandbox.stub(wreck, 'request').value(async (...args) => requestMethod(...args))
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('save', () => {
    const saveResponse = { saved: true }

    lab.beforeEach(() => {
      sandbox.stub(wreck, 'read').value(async () => saveResponse)
    })

    lab.test('when api is enabled', async () => {
      const data = { hasData: true }
      const persistence = Persistence.createDAO({ path })
      const result = await persistence.save(data)
      Code.expect(result).to.equal(saveResponse)

      // Now check request was called with the correct arguments
      const [method, uri, { payload }] = requestArgs
      Code.expect(method).to.equal('POST')
      Code.expect(uri).to.endWith(path)
      Code.expect(JSON.parse(payload).hasData).to.equal(true)
    })

    lab.test('when api is enabled and data contains an id', async () => {
      const data = { id: '59e06f54-e1ea-4cc3-a373-69db89174dfc', hasData: true }
      const persistence = Persistence.createDAO({ path })
      const result = await persistence.save(data)
      Code.expect(result).to.equal(saveResponse)

      // Now check request was called with the correct arguments
      const [method, uri, { payload }] = requestArgs
      Code.expect(method).to.equal('PATCH')
      Code.expect(uri).to.endWith(`${path}/${data.id}`)
      Code.expect(JSON.parse(payload).hasData).to.equal(true)
    })

    lab.test('when api is disabled', async () => {
      const data = { hasData: true }
      const persistence = Persistence.createDAO({ path, serviceApiEnabled: false })
      const result = await persistence.save(data)
      Code.expect(result.hasData).to.equal(true)
    })

    lab.test('when request throws an error', async () => {
      const data = { hasSomeData: true }

      // Override stubbed request method
      const testError = new Error('test error')
      requestMethod = () => {
        throw testError
      }

      const persistence = Persistence.createDAO({ path })
      let error
      try {
        await persistence.save(data)
      } catch (err) {
        error = err
      }
      Code.expect(error).to.equal(testError)
    })
  })

  lab.experiment('restore', () => {
    const restoreResponse = { restored: true }

    lab.beforeEach(() => {
      sandbox.stub(wreck, 'read').value(async () => restoreResponse)
    })

    lab.test('when api is enabled', async () => {
      const id = 'ID'
      const persistence = Persistence.createDAO({ path })
      const result = await persistence.restore(id)
      Code.expect(result).to.equal(restoreResponse)

      // Now check request was called with the correct arguments
      const [method, uri] = requestArgs
      Code.expect(method).to.equal('GET')
      Code.expect(uri).to.endWith(`${path}/${id}`)
    })

    lab.test('when api is disabled', async () => {
      const id = 'ID'
      const persistence = Persistence.createDAO({ path, serviceApiEnabled: false })
      const result = await persistence.restore(id)
      Code.expect(result).to.equal({ id })
    })

    lab.test('when config is invalid', async () => {
      let error
      let persistence
      try {
        persistence = Persistence.createDAO({})
      } catch (err) {
        error = err
      }
      Code.expect(persistence).to.equal(undefined)
      Code.expect(error).to.equal(new Error('The persistence config is invalid. "path" is required'))
    })

    lab.test('when request throws an error', async () => {
      const id = 'ID'

      // Override stubbed request method
      const testError = new Error('test error')
      requestMethod = () => {
        throw testError
      }

      const persistence = Persistence.createDAO({ path })
      let error
      try {
        await persistence.restore(id)
      } catch (err) {
        error = err
      }
      Code.expect(error).to.equal(testError)
    })
  })
})
