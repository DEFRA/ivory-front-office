const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const pageHeading = 'How are you acting on behalf of the owner?'
const url = '/agent'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  testHelper.getRequestTests({ lab, pageHeading, url })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when nothing is selected', async ({ context }) => {
      const { request } = context
      return testHelper.expectValidationErrors(request, [
        { field: 'agentActingAs', message: 'Select how you acting on behalf of the owner' }
      ])
    })
  })
})
