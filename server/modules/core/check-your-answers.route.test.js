const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/check-your-answers'
const pageHeading = 'Check your answers'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page answers are displayed correctly', async ({ context }) => {
      const agentIsOwner = true
      const agentActingAs = 'trustee'
      const fullName = 'James Bond'
      const addressLine = 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
      const description = 'A violin bow with an ivory tip.'

      Object.assign(routesHelper.cache, {
        registration: { agentIsOwner, agentActingAs },
        owner: { fullName },
        'owner-address': { addressLine },
        item: { description }
      })

      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#owner-full-name').text()).to.include(fullName)
      Code.expect($('#owner-address-line').text()).to.include(addressLine)
      Code.expect($('#item-description').text()).to.include(description)
    })
  })
})
