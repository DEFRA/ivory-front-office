const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/owner-address-select'
const pageHeading = `Owner's address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    let postcodeAddressList

    lab.beforeEach(() => {
      postcodeAddressList = [
        {
          uprn: '340116',
          addressLine: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH'
        }, {
          uprn: '340117',
          addressLine: 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
        }
      ]

      routesHelper.cache['owner-address'] = { postcodeAddressList }
    })

    lab.test('page heading is correct when no agent', async ({ context }) => {
      routesHelper.cache.registration = { agentIsOwner: true }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('addresses has been pre-filled, none selected', async ({ context }) => {
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal('')
    })

    lab.test('addresses has been pre-filled, one selected', async ({ context }) => {
      const uprn = postcodeAddressList[0].uprn
      routesHelper.cache['owner-address'].uprn = uprn

      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal(uprn)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    const address = { uprn: '1234' }
    lab.beforeEach(() => {
      routesHelper.cache['owner-address'] = {
        postcodeAddressList: [
          address
        ]
      }
    })

    lab.test('fails validation when an address has not been selected', async ({ context }) => {
      const { request } = context
      request.payload['address'] = ''
      return routesHelper.expectValidationErrors(request, [
        { field: 'address', message: 'Select an address' }
      ])
    })

    lab.test('redirects correctly when the address has been selected', async ({ context }) => {
      const { request } = context
      request.payload['address'] = address.uprn
      await routesHelper.expectRedirection(request, '/item-description')
      Code.expect(routesHelper.cache['owner-address'].uprn).to.equal(address.uprn)
    })
  })
})
