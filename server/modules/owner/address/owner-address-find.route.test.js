const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const { AddressLookUp } = require('ivory-shared')
const config = require('../../../config')
const url = '/owner-address'
const pageHeading = 'Owner\'s address'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(config, 'addressLookUpEnabled').value(true)
      sandbox.stub(config, 'addressLookUpUri').value('http://fake.com')
      sandbox.stub(config, 'addressLookUpUsername').value('username')
      sandbox.stub(config, 'addressLookUpPassword').value('password')
      sandbox.stub(config, 'addressLookUpKey').value('key')
      sandbox.stub(AddressLookUp.prototype, 'lookUpByPostcode').value((postcode) => {
        switch (postcode) {
          case 'WA41AB':
            // Contains an address for a valid postcode
            return [{}]
          case 'WA41A':
            // Postcode was invalid
            return { message: 'invalid postcode' }
          default:
            // Contains no addresses for a valid postcode
            return []
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      routesHelper.cache.Registration = { agentIsOwner: true }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Your address')
    })

    lab.test('postcode has not been pre-filled', async ({ context }) => {
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async ({ context }) => {
      const postcode = 'WC1A 1AA'
      routesHelper.cache.OwnerAddress = { postcode }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
    })

    lab.test('redirects to manual address', async ({ context }) => {
      const { request } = context
      config.addressLookUpEnabled = false
      await routesHelper.expectRedirection(request, '/owner-full-address')
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the postcode has not been entered', async ({ context }) => {
      const { request } = context
      request.payload.postcode = ''
      return routesHelper.expectValidationErrors(request, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('fails validation when the postcode lookup returns a message without an error', async ({ context }) => {
      const { request } = context
      request.payload.postcode = 'WA41A'
      return routesHelper.expectValidationErrors(request, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async ({ context }) => {
      const { request } = context
      const postcode = 'WA41AB'
      request.payload.postcode = postcode
      await routesHelper.expectRedirection(request, '/owner-address-select')
      Code.expect(routesHelper.cache.OwnerAddress.postcode).to.equal(postcode)
    })
  })
})
