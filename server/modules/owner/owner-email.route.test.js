const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-email'
const pageHeading = `Owner's email address`

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      routesHelper.cache.registration = { agentIsOwner: true }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your email address`)
    })

    lab.test('email address has not been pre-filled', async ({ context }) => {
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.not.exist()
    })

    lab.test('email address has been pre-filled', async ({ context }) => {
      const email = 'James Bond'
      routesHelper.cache.owner = { email }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.equal(email)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the email address has not been entered', async ({ context }) => {
      const { request } = context
      request.payload.email = ''
      return routesHelper.expectValidationErrors(request, [
        { field: 'email', message: 'Enter an email address in the correct format, like name@example.com' }
      ])
    })

    lab.test('redirects correctly when the email address has been entered', async ({ context }) => {
      const { request } = context
      const email = 'james.bond@defra.test.gov.uk'
      request.payload.email = email
      await routesHelper.expectRedirection(request, '/owner-address')
      Code.expect(routesHelper.cache.owner.email).to.equal(email)
    })
  })
})
