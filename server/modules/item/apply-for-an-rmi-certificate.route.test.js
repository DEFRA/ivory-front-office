const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/apply-for-an-rmi-certificate'
const pageHeading = 'Apply for a certificate for a rare and most important (RMI) item'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)
  routesHelper.getRequestTests({ lab, pageHeading, url })
})
