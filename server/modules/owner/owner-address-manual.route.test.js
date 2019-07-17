const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-full-address'

lab.experiment(TestHelper.getFile(__filename), () => {
  let address

  lab.beforeEach(() => {
    address = {
      addressLine1: '38',
      street: 'Smith Rd',
      town: 'Jonesville',
      county: 'Anyshire',
      postcode: 'WC1A 1AA'
    }
  })

  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url
      }

      testHelper.cache.registration = {}
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      testHelper.cache.registration = { agentIsOwner: 'agent' }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's address`)
    })

    lab.test('address has not been pre-filled', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('address has been pre-filled', async () => {
      testHelper.cache['owner-address'] = address
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address-line-1').val()).to.equal(address.addressLine1)
      Code.expect($('#address-line-2').val()).to.equal(address.street)
      Code.expect($('#address-town').val()).to.equal(address.town)
      Code.expect($('#address-county').val()).to.equal(address.county)
      Code.expect($('#address-postcode').val()).to.equal(address.postcode)
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

    lab.test('fails validation when the address has not been entered', async () => {
      Object.assign(request.payload, {
        'address-line-1': '',
        'address-line-2': '',
        'address-town': '',
        'address-county': '',
        'address-postcode': ''
      })
      return testHelper.expectValidationErrors(request, [
        { field: 'address-line-1', message: 'Enter a valid building number or name' },
        { field: 'address-town', message: 'Enter a valid town' },
        { field: 'address-postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('redirects correctly when the address has been manually entered correctly', async () => {
      Object.assign(request.payload, {
        'address-line-1': address.addressLine1,
        'address-line-2': address.street,
        'address-town': address.town,
        'address-county': address.county,
        'address-postcode': address.postcode
      })
      await testHelper.expectRedirection(request, '/item-description')
      Code.expect(testHelper.cache['owner-address'].postcode).to.equal(address.postcode)
    })
  })
})
