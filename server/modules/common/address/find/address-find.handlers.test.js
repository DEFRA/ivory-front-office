const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('../../../../lib/handlers/handlers')
const defraHapiUtils = require('defra-hapi-utils')
const config = require('../../../../config')
const AddressLookUp = defraHapiUtils.AddressLookUp
const TestHelper = require('../../../../../test-helper')

class Address {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class FindAddressHandlers extends require('./address-find.handlers') {
  get Address () {
    return Address
  }

  async manualAddressLink () {
    return '/manualAddress'
  }
}

const postcode = 'AB12 3CD'

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(config, 'addressLookUpEnabled').get(() => true)
    sandbox.stub(config, 'addressLookUpUri').get(() => 'http://afddress-look-up.defra.com')
    sandbox.stub(config, 'addressLookUpUsername').get(() => 'username')
    sandbox.stub(config, 'addressLookUpPassword').get(() => 'password')
    sandbox.stub(config, 'addressLookUpKey').get(() => 'key')
    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})
    sandbox.stub(AddressLookUp.prototype, 'lookUpByPostcode').value(() => { return [] })

    const handlers = new FindAddressHandlers()

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

  lab.test('handleGet builds view data as expected when full name has been entered previously', async ({ context }) => {
    const { request, h, handlers, sandbox } = context

    // Make sure Address has the 'postcode' value set to AB12 3CD
    sandbox.stub(FindAddressHandlers.prototype, 'Address').get(() => {
      return { get: () => { return { postcode } } }
    })

    await handlers.handleGet(request, h)

    Code.expect(handlers.viewData).to.equal({ postcode, manualAddressLink: await handlers.manualAddressLink() })
  })

  lab.test('handlePost sets Address data correctly', async ({ context }) => {
    const { request, handlers } = context
    const expectedData = { postcode, postcodeAddressList: [] }
    request.payload = { postcode }
    await handlers.handlePost(request)
    Code.expect(Address.get(request)).to.equal(expectedData)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({ postcode: '' }, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({ postcode: { text: 'Enter postcode', href: '#postcode' } })
  })
})
