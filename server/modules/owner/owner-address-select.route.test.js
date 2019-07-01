const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../test-helper')
const url = '/owner-address-select'

lab.experiment('Test Owner Address Select', () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url
      }
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(getRequest)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      const response = await testHelper.server.inject(getRequest)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      testHelper.cache.agent = {}
      const response = await testHelper.server.inject(getRequest)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's address`)
    })
  })

  lab.experiment(`POST ${url}`, () => {
    let request
    let address = { uprn: '1234' }

    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url,
        payload: {}
      }

      testHelper.cache['owner-address'] = {
        postcodeAddressList: [
          address
        ]
      }
    })

    lab.test('fails validation when an address has not been selected', async () => {
      request.payload['address'] = ''
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(400)

      const $ = testHelper.getDomParser(response.payload)

      Code.expect($(testHelper.errorSummarySelector('address')).text()).to.equal('Select an address')
      Code.expect($(testHelper.errorMessageSelector('address')).text()).to.include('Select an address')
    })

    lab.test('redirects correctly when the address has been selected', async () => {
      request.payload['address'] = address.uprn
      const response = await testHelper.server.inject(request)

      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers['location']).to.equal('/item-description')
    })
  })
})
