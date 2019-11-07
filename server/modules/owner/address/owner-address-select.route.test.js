const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/owner-address-select'
const pageHeading = 'Owner\'s address'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    let postcodeAddressList

    lab.beforeEach(({ context }) => {
      postcodeAddressList = [
        {
          uprn: '340116',
          addressLine: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH'
        }, {
          uprn: '340117',
          addressLine: 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
        }
      ]

      TestHelper.setCache(context, 'OwnerAddress', { postcodeAddressList })
    })

    lab.test('page heading is correct when no agent', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'i-own-it' })
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

    lab.test('addresses has been pre-filled, none selected', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal('')
    })

    lab.test('addresses has been pre-filled, one selected', async ({ context }) => {
      const { request, server } = context
      const uprn = postcodeAddressList[0].uprn

      TestHelper.setCache(context, 'OwnerAddress', { uprn })

      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal(uprn)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    const address = { uprn: '1234' }
    lab.beforeEach(({ context }) => {
      const postcodeAddressList = [
        address
      ]
      TestHelper.setCache(context, 'OwnerAddress', { postcodeAddressList })
    })

    lab.test('fails validation when an address has not been selected', async ({ context }) => {
      const { request } = context
      request.payload.address = ''
      return routesHelper.expectValidationErrors(context, [
        { field: 'address', message: 'Select an address' }
      ])
    })

    lab.test('redirects correctly when the address has been selected when there is no agent', async ({ context }) => {
      const { request } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'i-own-it' })
      request.payload.address = address.uprn
      await routesHelper.expectRedirection(context, '/owner-email')
      Code.expect(TestHelper.getCache(context, 'OwnerAddress').uprn).to.equal(address.uprn)
    })

    lab.test('redirects correctly when the address has been selected when there is an agent', async ({ context }) => {
      const { request } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'someone-else' })
      request.payload.address = address.uprn
      await routesHelper.expectRedirection(context, '/dealing-intent')
      Code.expect(TestHelper.getCache(context, 'OwnerAddress').uprn).to.equal(address.uprn)
    })
  })
})
