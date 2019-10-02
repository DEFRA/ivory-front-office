const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/confirmation'
const pageHeading = 'Registration complete'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  lab.beforeEach(({ context }) => {
    TestHelper.setCache(context, 'Registration', { registrationNumber: 'abc', status: 'submitted' })
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })
})
