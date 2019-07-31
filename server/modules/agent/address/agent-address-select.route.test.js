const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/agent-address-select'
const pageHeading = `Your address`

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

      routesHelper.cache['agent-address'] = { postcodeAddressList }
    })

    lab.test('addresses has been pre-filled, none selected', async ({ context }) => {
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal('')
    })

    lab.test('addresses has been pre-filled, one selected', async ({ context }) => {
      const uprn = postcodeAddressList[0].uprn
      routesHelper.cache['agent-address'].uprn = uprn

      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal(uprn)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    const address = { uprn: '1234' }
    lab.beforeEach(() => {
      routesHelper.cache['agent-address'] = {
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
      await routesHelper.expectRedirection(request, '/owner-name')
      Code.expect(routesHelper.cache['agent-address'].uprn).to.equal(address.uprn)
    })
  })
})
