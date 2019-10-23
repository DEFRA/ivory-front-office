const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/owner-address-full'
const pageHeading = 'Owner\'s address'

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.beforeEach(({ context }) => {
    context.address = {
      businessName: 'Sprockets Ltd',
      addressLine1: '38',
      addressLine2: 'Smith Rd',
      town: 'Jonesville',
      county: 'Anyshire',
      postcode: 'WC1A 1AA'
    }
  })

  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'agent' })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Your address')
    })

    lab.test('page heading is correct when an agent is involved', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'someone-else' })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Owner\'s address')
    })

    lab.test('address has not been pre-filled', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('address has been pre-filled', async ({ context }) => {
      const { request, server, address } = context
      TestHelper.setCache(context, 'OwnerAddress', address)
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      // ToDo: This needs the comment removed when we include the business name
      // Code.expect($('#business-name').val()).to.equal(address.businessName)
      Code.expect($('#address-line-1').val()).to.equal(address.addressLine1)
      Code.expect($('#address-line-2').val()).to.equal(address.addressLine2)
      Code.expect($('#address-town').val()).to.equal(address.town)
      Code.expect($('#address-county').val()).to.equal(address.county)
      Code.expect($('#address-postcode').val()).to.equal(address.postcode)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the address has not been entered', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'address-line-1', message: 'Enter building and street' },
        { field: 'address-town', message: 'Enter town or city' },
        { field: 'address-postcode', message: 'Enter postcode' }
      ])
    })

    lab.test('fails validation when the address fields exceed maximum characters', async ({ context }) => {
      const { request } = context
      Object.assign(request.payload, {
        // ToDo: This needs the comment removed when we include the business name
        // 'business-name': 'x'.repeat(101),
        'address-line-1': 'x'.repeat(101),
        'address-line-2': 'x'.repeat(101),
        'address-town': 'x'.repeat(101),
        'address-county': 'x'.repeat(101),
        'address-postcode': 'x'.repeat(9)
      })

      return routesHelper.expectValidationErrors(context, [
        // ToDo: This needs the comment removed when we include the business name
        // { field: 'business-name', message: 'Business name must be 100 characters or fewer' },
        { field: 'address-line-1', message: 'Building and street must be 100 characters or fewer' },
        { field: 'address-line-2', message: 'Second address line must be 100 characters or fewer' },
        { field: 'address-town', message: 'Town or city must be 100 characters or fewer' },
        { field: 'address-county', message: 'County must be 100 characters or fewer' },
        { field: 'address-postcode', message: 'Postcode must be 8 characters or fewer' }
      ])
    })

    lab.test('redirects correctly when the address has been manually entered correctly and there is no agent', async ({ context }) => {
      const { request, address } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'agent' })
      Object.assign(request.payload, {
        'address-line-1': address.addressLine1,
        'address-line-2': address.addressLine2,
        'address-town': address.town,
        'address-county': address.county,
        'address-postcode': address.postcode
      })
      await routesHelper.expectRedirection(context, '/owner-email')
      Code.expect(TestHelper.getCache(context, 'OwnerAddress').postcode).to.equal(address.postcode)
    })

    lab.test('redirects correctly when the address has been manually entered correctly and there is an agent', async ({ context }) => {
      const { request, address } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'someone-else' })
      Object.assign(request.payload, {
        'address-line-1': address.addressLine1,
        'address-line-2': address.addressLine2,
        'address-town': address.town,
        'address-county': address.county,
        'address-postcode': address.postcode
      })
      await routesHelper.expectRedirection(context, '/dealing-intent')
      Code.expect(TestHelper.getCache(context, 'OwnerAddress').postcode).to.equal(address.postcode)
    })
  })
})
