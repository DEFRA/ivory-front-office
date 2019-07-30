const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/agent-email'
const pageHeading = `Your email address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename)

  testHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('email address has not been pre-filled', async ({ context }) => {
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.not.exist()
    })

    lab.test('email address has been pre-filled', async ({ context }) => {
      const email = 'James Bond'
      testHelper.cache.agent = { email }
      const response = await testHelper.server.inject(context.request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.equal(email)
    })
  })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the email address has not been entered', async ({ context }) => {
      const { request } = context
      request.payload.email = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'email', message: 'Enter an email address in the correct format, like name@example.com' }
      ])
    })

    lab.test('redirects correctly when the email address has been entered', async ({ context }) => {
      const { request } = context
      const email = 'james.bond@defra.test.gov.uk'
      request.payload.email = email
      await testHelper.expectRedirection(request, '/agent-address')
      Code.expect(testHelper.cache.agent.email).to.equal(email)
    })
  })
})
