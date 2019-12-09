const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('defra-hapi-plugin-handlers')
const TestHelper = require('../../../../../test-helper')

class Address {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class ManualAddressHandlers extends require('./address-manual.handlers') {
  get Address () {
    return Address
  }

  get findAddressLink () {
    return '/find-address'
  }
}

const businessName = 'Business Ltd'
const addressLine1 = 'My House'
const addressLine2 = '10 Downing Street'
const town = 'London'
const county = 'Also London'
const postcode = 'AB12 3CD'

const address = { businessName, addressLine1, addressLine2, town, county, postcode }

const addressPayload = {
  'business-name': businessName,
  'address-line-1': addressLine1,
  'address-line-2': addressLine2,
  'address-town': town,
  'address-county': county,
  'address-postcode': postcode
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new ManualAddressHandlers()

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

  lab.test('handleGet builds view data as expected when address has been entered previously', async ({ context }) => {
    const { request, handlers, sandbox } = context

    sandbox.stub(ManualAddressHandlers.prototype, 'Address').get(() => {
      return { get: () => { return address } }
    })

    await handlers.handleGet(request)

    const expectedViewData = Object.assign({
      findAddressLink: handlers.findAddressLink
    }, addressPayload)

    Code.expect(handlers.viewData).to.equal(expectedViewData)
  })

  lab.test('handlePost sets Address data correctly', async ({ context }) => {
    const { request, handlers } = context
    const expectedData = Object.assign({ addressLine: ([addressLine1, addressLine2, town, postcode]).join(', ') }, address)
    request.payload = addressPayload
    await handlers.handlePost(request)
    Code.expect(Address.get(request)).to.equal(expectedData)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({}, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({
      'address-line-1': {
        text: 'Enter building and street',
        href: '#address-line-1'
      },
      'address-town': {
        text: 'Enter town or city',
        href: '#address-town'
      },
      'address-postcode': {
        text: 'Enter postcode',
        href: '#address-postcode'
      }
    })
  })
})
