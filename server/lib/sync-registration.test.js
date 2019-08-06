const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const { utils } = require('ivory-shared')
const syncRegistration = require('./sync-registration')

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  let request
  let cache

  lab.beforeEach(() => {
    request = {}
    cache = {}
    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox, { skip: { syncRegistration: true } })
    sandbox.stub(utils, 'getCache').value((request, key) => {
      if (typeof key === 'string') {
        if (cache[key] === undefined) {
          cache[key] = {}
        }
        return cache[key]
      }
      return key.map((key) => cache[key])
    })
    sandbox.stub(utils, 'setCache').value((request, key, val) => { cache[key] = val })
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('restore', () => {
    lab.test(`registration restores ok`, async () => {
      const result = await syncRegistration.restore(request)
      Code.expect(result).to.equal(true)
    })
  })

  lab.experiment('save', () => {
    lab.test(`fails as registration doesn't exist`, async () => {
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(false)
    })

    lab.test(`passes as registration exists with empty cache entries`, async () => {
      cache = {
        registration: {},
        owner: {},
        'owner-address': {},
        agent: {},
        'agent-address': {},
        item: {}

      }
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(true)
      Code.expect(cache).to.equal({
        registration: {},
        owner: {},
        'owner-address': {},
        agent: {},
        'agent-address': {},
        item: {}
      })
    })

    lab.test(`passes as registration exists with only owner cache entries with sanitised address details`, async () => {
      cache = {
        registration: {},
        owner: {},
        'owner-address': {
          street: 'somewhere street',
          road: 'no where road'
        }
      }
      const registration = await syncRegistration.save(request)
      Code.expect(registration).to.equal(true)
      Code.expect(cache).to.equal({
        registration: {},
        owner: {},
        'owner-address': {
          street: 'somewhere street'
        }
      })
    })
  })
})
