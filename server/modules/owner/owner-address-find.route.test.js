const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const addressLookup = require('../../lib/connectors/address-lookup/addressLookup')
const url = '/owner-address'

lab.experiment('Test Owner Address Find', () => {
  const testHelper = new TestHelper(lab, {
    stubCallback: (sandbox) => {
      sandbox.stub(addressLookup, 'lookUpByPostcode').value((postcode) => {
        if (postcode === 'WA41AB') {
          return [{}]
        } else {
          return []
        }
      })
    }
  })

  lab.experiment(`GET ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url
      }

      testHelper.cache.item = {}
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      testHelper.cache.item = { ownerIsAgent: true }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's address`)
    })

    lab.test('postcode has not been pre-filled', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async () => {
      const postcode = 'WC1A 1AA'
      testHelper.cache['owner-address'] = { postcode }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
    })
  })

  lab.experiment(`POST ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    lab.test('fails validation when the postcode has not been entered', async () => {
      request.payload['postcode'] = ''
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(400)

      const $ = testHelper.getDomParser(response.payload)

      Code.expect($(testHelper.errorSummarySelector('postcode')).text()).to.equal('Enter a valid postcode')
      Code.expect($(testHelper.errorMessageSelector('postcode')).text()).to.include('Enter a valid postcode')
    })

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async () => {
      const postcode = 'WA41AB'
      request.payload['postcode'] = postcode
      const response = await testHelper.server.inject(request)

      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers['location']).to.equal('/owner-address-select')
      Code.expect(testHelper.cache['owner-address'].postcode).to.equal(postcode)
    })

    lab.test('redirects to manual address correctly when a postcode has been entered that has no addresses', async () => {
      const postcode = 'WA41XX'
      request.payload['postcode'] = postcode
      const response = await testHelper.server.inject(request)

      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers['location']).to.equal('/owner-full-address')
      Code.expect(testHelper.cache['owner-address'].postcode).to.equal(postcode)
    })
  })
})
