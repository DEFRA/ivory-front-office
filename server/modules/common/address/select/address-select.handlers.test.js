const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Handlers = require('defra-hapi-plugin-handlers')
const TestHelper = require('../../../../../test-helper')

const foundAddress = {
  addressLine: 'address line',
  uprn: 'uprn'
}

const address = {
  uprn: foundAddress.uprn,
  postcodeAddressList: [foundAddress]
}

class Address {
  static get (request) { return request._data }
  static set (request, data) { request._data = data }
}

class SelectAddressHandlers extends require('./address-select.handlers') {
  get Address () {
    return Address
  }

  get manualAddressLink () {
    return '/manual-address'
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    // Create a sinon sandbox to stub methods
    const sandbox = context.sandbox = sinon.createSandbox()

    sandbox.stub(Handlers.prototype, 'handleGet').value(() => {})
    sandbox.stub(Handlers.prototype, 'handlePost').value(() => {})

    const handlers = new SelectAddressHandlers()

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
    const { request, handlers, sandbox } = context

    sandbox.stub(SelectAddressHandlers.prototype, 'Address').get(() => {
      return { get: () => { return address } }
    })

    await handlers.handleGet(request)

    Code.expect(handlers.viewData).to.equal({
      chooseAddressHint: 'Choose an address',
      addresses: [
        {
          text: '1 addresses found'
        },
        {
          value: foundAddress.uprn,
          text: foundAddress.addressLine,
          selected: true
        }],
      manualAddressLink: handlers.manualAddressLink
    })
  })

  lab.test('handlePost sets Address data correctly', async ({ context }) => {
    const { request, handlers } = context
    const expectedData = address
    request.payload = { address: address.uprn }
    await Address.set(request, address)
    await handlers.handlePost(request)
    Code.expect(Address.get(request)).to.equal(expectedData)
  })

  lab.test('schema validates correctly', async ({ context }) => {
    const { handlers, request } = context
    const { error } = handlers.validate({ address: '' }, { abortEarly: false })
    Code.expect(await handlers.formatErrors(request, error)).to.equal({ address: { text: 'Select an address', href: '#address' } })
  })
})
