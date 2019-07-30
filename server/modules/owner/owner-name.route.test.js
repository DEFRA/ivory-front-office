const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-name'
const pageHeading = `Owner's name`

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename)

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      testHelper.cache.registration = { agentIsOwner: true }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your name`)
    })

    lab.test('full name has not been pre-filled', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.not.exist()
    })

    lab.test('full name has been pre-filled', async ({ context }) => {
      const fullName = 'James Bond'
      testHelper.cache.owner = { fullName: 'James Bond' }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.equal(fullName)
    })
  })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the full name has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['full-name'] = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'full-name', message: 'Enter your full name' }
      ])
    })

    lab.test('redirects correctly when the full name has been entered', async ({ context }) => {
      const { request } = context
      const fullName = 'James Bond'
      request.payload['full-name'] = fullName
      await testHelper.expectRedirection(request, '/owner-email')
      Code.expect(testHelper.cache.owner.fullName).to.equal(fullName)
    })
  })
})
