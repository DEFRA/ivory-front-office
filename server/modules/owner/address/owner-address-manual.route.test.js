const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/owner-full-address'
const pageHeading = `Owner's address`

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

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      testHelper.cache.registration = { agentIsOwner: 'agent' }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('address has not been pre-filled', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('address has been pre-filled', async ({ context }) => {
      testHelper.cache['owner-address'] = address
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address-line-1').val()).to.equal(address.addressLine1)
      Code.expect($('#address-line-2').val()).to.equal(address.street)
      Code.expect($('#address-town').val()).to.equal(address.town)
      Code.expect($('#address-county').val()).to.equal(address.county)
      Code.expect($('#address-postcode').val()).to.equal(address.postcode)
    })
  })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the address has not been entered', async ({ context }) => {
      const { request } = context
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

    lab.test('redirects correctly when the address has been manually entered correctly', async ({ context }) => {
      const { request } = context
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
