const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')
const url = '/agent-address'
const pageHeading = `Your address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(addressLookup, 'lookUpByPostcode').value((postcode) => {
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

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('postcode has not been pre-filled', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async ({ context }) => {
      const postcode = 'WC1A 1AA'
      testHelper.cache['agent-address'] = { postcode }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
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

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async ({ context }) => {
      const { request } = context
      const postcode = 'WA41AB'
      request.payload['postcode'] = postcode
      await testHelper.expectRedirection(request, '/agent-address-select')
      Code.expect(testHelper.cache['agent-address'].postcode).to.equal(postcode)
    })
  })
})
