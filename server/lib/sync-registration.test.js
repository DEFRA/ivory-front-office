const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const { Cache, Persistence } = require('ivory-shared')
const syncRegistration = require('./sync-registration')

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox

  lab.beforeEach(({ context }) => {
    context.request = { cache: {} }
    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox, { skip: { syncRegistration: true } })
    sandbox.stub(Cache, 'get').value((request, key) => {
      const { cache } = request
      if (typeof key === 'string') {
        return cache[key]
      }
      return key.map((key) => cache[key])
    })
    sandbox.stub(Cache, 'set').value((request, key, val) => { request.cache[key] = val })
    sandbox.stub(Persistence.prototype, 'save').value((data) => data)
    sandbox.stub(Persistence.prototype, 'restore').value(() => ({}))
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('restore', () => {
    lab.test('registration restores ok', async ({ context }) => {
      const { request } = context
      const result = await syncRegistration.restore(request)
      Code.expect(result).to.equal(true)
    })
  })

  lab.experiment('save', () => {
    lab.test('fails as registration doesn\'t exist', async ({ context }) => {
      const { request } = context
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(false)
    })

    lab.test('passes as registration exists with empty cache entries', async ({ context }) => {
      const { request } = context
      Object.assign(request.cache, {
        Registration: {},
        Owner: {},
        OwnerAddress: {},
        Agent: {},
        AgentAddress: {},
        Item: {}
      })
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(true)
      Code.expect(request.cache).to.equal({
        Registration: {},
        Owner: {},
        OwnerAddress: {},
        Agent: {},
        AgentAddress: {},
        Item: {}
      })
    })

    lab.test('passes as registration exists with only owner cache entries with sanitised address details', async ({ context }) => {
      const { request } = context
      Object.assign(request.cache, {
        Registration: {},
        Owner: {},
        OwnerAddress: {
          addressLine1: 'the house',
          addressLine2: 'somewhere street',
          road: 'no where road'
        }
      })
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(true)
      Code.expect(request.cache).to.equal({
        Registration: {},
        Owner: {},
        OwnerAddress: {
          addressLine1: 'the house',
          addressLine2: 'somewhere street',
          addressLine: 'the house, somewhere street'
        }
      })
    })
  })
})
