const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/apply-to-register-to-sell-an-item-to-a-museum'
const pageHeading = 'Apply to register to sell an item to a museum'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)
  routesHelper.getRequestTests({ lab, pageHeading, url })
})
