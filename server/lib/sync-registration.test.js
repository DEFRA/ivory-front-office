const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const { Persistence } = require('ivory-shared')
const SyncRegistration = require('./sync-registration')

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Stub methods
    context.sandbox = sinon.createSandbox()
    context.skip = { syncRegistration: true }
    context.syncRegistration = new SyncRegistration()
    TestHelper.stubCache(context)
    const { sandbox } = context
    sandbox.stub(Persistence.prototype, 'save').value((data) => data)
    sandbox.stub(Persistence.prototype, 'restore').value(() => ({}))
    TestHelper.clearCache(context)
  })

  lab.afterEach(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('restore', () => {
    lab.test('registration restores ok', async ({ context }) => {
      const { request, syncRegistration } = context
      const result = await syncRegistration.restore(request)
      Code.expect(result).to.equal(true)
    })
  })

  lab.experiment('save', () => {
    lab.test('fails as registration doesn\'t exist', async ({ context }) => {
      const { request, syncRegistration } = context
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(false)
    })

    lab.test('passes as registration exists with empty cache entries', async ({ context }) => {
      const { syncRegistration } = context

      const cache = {
        Registration: {},
        Owner: {},
        OwnerAddress: {},
        Agent: {},
        AgentAddress: {},
        Payment: {},
        Item: {}
      }

      Object.entries(cache).forEach(([key, val]) => {
        TestHelper.setCache(context, key, val)
      })

      const registration = await syncRegistration.save(context.request)
      Code.expect(registration).to.equal(true)
      Code.expect(context.request.app.cache).to.equal(cache)
    })

    lab.test('passes as registration exists with only owner cache entries with sanitised address details', async ({ context }) => {
      const { syncRegistration } = context

      const address = {
        addressLine1: 'the house',
        addressLine2: 'somewhere street',
        town: 'no where town'
      }

      address.addressLine = Object.values(address).join(', ')
      const cache = {
        Registration: {
          ownerType: 'i-own-it'
        },
        Agent: undefined,
        AgentAddress: undefined,
        Item: undefined,
        Owner: {},
        OwnerAddress: address,
        Payment: undefined
      }

      Object.entries(cache).forEach(([key, val]) => {
        TestHelper.setCache(context, key, val)
      })

      const registration = await syncRegistration.save(context.request)
      Code.expect(registration).to.equal(true)
      Code.expect(TestHelper.getCache(context)).to.equal(cache)
    })
  })
})
