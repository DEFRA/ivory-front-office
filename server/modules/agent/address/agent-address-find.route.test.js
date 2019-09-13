const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const config = require('../../../config')
const { AddressLookUp } = require('ivory-shared')
const url = '/agent-address'
const pageHeading = 'Your address'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(config, 'addressLookUpEnabled').value(true)
      sandbox.stub(config, 'addressLookUpUri').value('http://fake.com')
      sandbox.stub(config, 'addressLookUpUsername').value('username')
      sandbox.stub(config, 'addressLookUpPassword').value('password')
      sandbox.stub(config, 'addressLookUpKey').value('key')
      sandbox.stub(AddressLookUp.prototype, 'lookUpByPostcode').value((postcode) => {
        if (postcode === 'WA41AB') {
          // Contains an address
          return [{}]
        } else {
          // Contains no addresses
          return []
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('postcode has not been pre-filled', async ({ context }) => {
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async ({ context }) => {
      const postcode = 'WC1A 1AA'
      routesHelper.cache.AgentAddress = { postcode }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
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

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async ({ context }) => {
      const { request } = context
      const postcode = 'WA41AB'
      request.payload.postcode = postcode
      await routesHelper.expectRedirection(request, '/agent-address-select')
      Code.expect(routesHelper.cache.AgentAddress.postcode).to.equal(postcode)
    })
  })
})
