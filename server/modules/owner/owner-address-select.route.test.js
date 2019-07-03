const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-address-select'

lab.experiment('Test Owner Address Select', () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let request
    let postcodeAddressList

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url
      }

      postcodeAddressList = [
        {
          uprn: '340116',
          addressLine: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH'
        }, {
          uprn: '340117',
          addressLine: 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
        }
      ]

      testHelper.cache['owner-address'] = { postcodeAddressList }
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      testHelper.cache.agent = {}
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's address`)
    })

    lab.test('addresses has been pre-filled, none selected', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal('')
    })

    lab.test('addresses has been pre-filled, one selected', async () => {
      const uprn = postcodeAddressList[0].uprn
      testHelper.cache['owner-address'].uprn = uprn

      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal(uprn)
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
      Code.expect(testHelper.cache['owner-address'].uprn).to.equal(address.uprn)
    })
  })
})
