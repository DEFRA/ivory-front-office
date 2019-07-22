const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/who-owns-item'
const pageHeading = 'Who owns the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  testHelper.getRequestTests({ lab, pageHeading, url })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      const { request } = context
      return testHelper.expectValidationErrors(request, [
        { field: 'agentIsOwner', message: 'Select who owns the item' }
      ])
    })
  })
})
