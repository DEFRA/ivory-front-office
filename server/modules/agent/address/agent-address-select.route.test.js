const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const url = '/agent-address-select'
const pageHeading = `Your address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
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

      testHelper.cache['agent-address'] = { postcodeAddressList }
    })

    lab.test('addresses has been pre-filled, none selected', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal('')
    })

    lab.test('addresses has been pre-filled, one selected', async ({ context }) => {
      const uprn = postcodeAddressList[0].uprn
      testHelper.cache['agent-address'].uprn = uprn

      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#address option:first-of-type').text()).to.equal(`${postcodeAddressList.length} addresses found`)
      Code.expect($('#address').val()).to.equal(uprn)
    })
  })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    const address = { uprn: '1234' }
    lab.beforeEach(() => {
      testHelper.cache['agent-address'] = {
        postcodeAddressList: [
          address
        ]
      }
    })

    lab.test('fails validation when an address has not been selected', async ({ context }) => {
      const { request } = context
      request.payload['address'] = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'address', message: 'Select an address' }
      ])
    })

    lab.test('redirects correctly when the address has been selected', async ({ context }) => {
      const { request } = context
      request.payload['address'] = address.uprn
      await testHelper.expectRedirection(request, '/owner-name')
      Code.expect(testHelper.cache['agent-address'].uprn).to.equal(address.uprn)
    })
  })
})
