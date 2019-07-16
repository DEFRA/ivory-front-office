const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-email'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url
      }
      testHelper.cache.item = {}
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      testHelper.cache.item = { ownerIsAgent: true }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your email address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's email address`)
    })

    lab.test('email address has not been pre-filled', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.not.exist()
    })

    lab.test('email address has been pre-filled', async () => {
      const email = 'James Bond'
      testHelper.cache.owner = { email }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#email').val()).to.equal(email)
    })
  })

  lab.experiment(`POST ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    lab.test('fails validation when the email address has not been entered', async () => {
      request.payload.email = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'email', message: 'Enter an email address in the correct format, like name@example.com' }
      ])
    })

    lab.test('redirects correctly when the email address has been entered', async () => {
      const email = 'james.bond@defra.test.gov.uk'
      request.payload.email = email
      await testHelper.expectRedirection(request, '/owner-address')
      Code.expect(testHelper.cache.owner.email).to.equal(email)
    })
  })
})
