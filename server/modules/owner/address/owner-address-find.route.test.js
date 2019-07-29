const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')
const config = require('../../../config')
const url = '/owner-address'
const pageHeading = `Owner's address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(addressLookup, 'lookUpByPostcode').value((postcode) => {
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

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      testHelper.cache.registration = { agentIsOwner: true }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('postcode has not been pre-filled', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async ({ context }) => {
      const postcode = 'WC1A 1AA'
      testHelper.cache['owner-address'] = { postcode }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
    })

    lab.test('redirects to manual address', async ({ context }) => {
      const { request } = context
      config.addressLookUpEnabled = false
      await testHelper.expectRedirection(request, '/owner-full-address')
    })
  })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the postcode has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['postcode'] = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('fails validation when the postcode lookup returns a message without an error', async ({ context }) => {
      const { request } = context
      request.payload['postcode'] = 'WA41A'
      return testHelper.expectValidationErrors(request, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async ({ context }) => {
      const { request } = context
      const postcode = 'WA41AB'
      request.payload['postcode'] = postcode
      await testHelper.expectRedirection(request, '/owner-address-select')
      Code.expect(testHelper.cache['owner-address'].postcode).to.equal(postcode)
    })
  })
})
