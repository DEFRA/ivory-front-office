const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const config = require('../../config')
const url = '/check-your-answers'
const pageHeading = 'Check your answers'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.beforeEach(({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'referenceData').value({
        dealingIntent: {
          choices: [
            { shortName: 'hire', label: 'hire' },
            { shortName: 'sell', label: 'sell' }
          ]
        },
        itemType: {
          choices: [
            { shortName: 'portrait-miniature-pre-1918', label: 'portrait-miniature-pre-1918' }
          ]
        }
      })
    })

    lab.test('page answers are displayed correctly', async ({ context }) => {
      const agentIsOwner = true
      const agentActingAs = 'trustee'
      const dealingIntent = 'hire'
      const itemType = 'portrait-miniature-pre-1918'
      const fullName = 'James Bond'
      const addressLine = 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
      const description = 'A violin bow with an ivory tip.'

      Object.assign(routesHelper.cache, {
        Registration: { agentIsOwner, agentActingAs, dealingIntent, itemType },
        Owner: { fullName },
        OwnerAddress: { addressLine },
        Item: { description }
      })

      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#owner-full-name').text()).to.include(fullName)
      Code.expect($('#owner-address-line').text()).to.include(addressLine)
      Code.expect($('#item-description').text()).to.include(description)
      Code.expect($('#dealing-intent').text()).to.include(dealingIntent)
      Code.expect($('#item-type').text()).to.include(itemType)
    })
  })
})
