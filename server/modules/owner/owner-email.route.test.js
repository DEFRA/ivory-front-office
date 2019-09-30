const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-email'
const pageHeading = 'Owner\'s email address'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { agentIsOwner: true })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Your email address')
    })

    lab.test('email address has not been pre-filled', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.not.exist()
    })

    lab.test('email address has been pre-filled', async ({ context }) => {
      const { request, server } = context
      const email = 'James Bond'
      TestHelper.setCache(context, 'Owner', { email })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.equal(email)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the email address has not been entered', async ({ context }) => {
      const { request } = context
      request.payload.email = ''
      return routesHelper.expectValidationErrors(context, [
        { field: 'email', message: 'Enter an email address in the correct format, like name@example.com' }
      ])
    })

    lab.test('redirects correctly when the email address has been entered', async ({ context }) => {
      const { request } = context
      const email = 'james.bond@defra.test.gov.uk'
      request.payload.email = email
      await routesHelper.expectRedirection(context, '/dealing-intent')
      Code.expect(TestHelper.getCache(context, 'Owner').email).to.equal(email)
    })
  })
})
