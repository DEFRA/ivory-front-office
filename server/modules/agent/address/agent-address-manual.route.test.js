const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/agent-full-address'
const pageHeading = 'Your address'

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    context.address = {
      addressLine1: '38',
      addressLine2: 'Smith Rd',
      town: 'Jonesville',
      county: 'Anyshire',
      postcode: 'WC1A 1AA'
    }
  })

  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('address has not been pre-filled', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('address has been pre-filled', async ({ context }) => {
      const { request, server, address } = context
      TestHelper.setCache(context, 'AgentAddress', address)
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address-line-1').val()).to.equal(address.addressLine1)
      Code.expect($('#address-line-2').val()).to.equal(address.addressLine2)
      Code.expect($('#address-town').val()).to.equal(address.town)
      Code.expect($('#address-county').val()).to.equal(address.county)
      Code.expect($('#address-postcode').val()).to.equal(address.postcode)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the address has not been entered', async ({ context }) => {
      const { request } = context
      Object.assign(request.payload, {
        'address-line-1': '',
        'address-line-2': '',
        'address-town': '',
        'address-county': '',
        'address-postcode': ''
      })
      return routesHelper.expectValidationErrors(context, [
        { field: 'address-line-1', message: 'Enter a valid building and street' },
        { field: 'address-town', message: 'Enter a valid town or city' },
        { field: 'address-postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('fails validation when the address fields only contains spaces', async ({ context }) => {
      const { request } = context
      Object.assign(request.payload, {
        'address-line-1': ' ',
        'address-line-2': ' ',
        'address-town': ' ',
        'address-county': ' ',
        'address-postcode': ' '
      })
      return routesHelper.expectValidationErrors(context, [
        { field: 'address-line-1', message: 'Enter a valid building and street' },
        { field: 'address-town', message: 'Enter a valid town or city' },
        { field: 'address-postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('redirects correctly when the address has been manually entered correctly', async ({ context }) => {
      const { request, address } = context
      Object.assign(request.payload, {
        'address-line-1': address.addressLine1,
        'address-line-2': address.addressLine2,
        'address-town': address.town,
        'address-county': address.county,
        'address-postcode': address.postcode
      })
      await routesHelper.expectRedirection(context, '/owner-name')
      Code.expect(TestHelper.getCache(context, 'AgentAddress').postcode).to.equal(address.postcode)
    })
  })
})
