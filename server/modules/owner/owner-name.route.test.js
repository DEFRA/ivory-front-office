const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-name'

lab.experiment('Test Owner Name', () => {
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

      Code.expect($('#defra-page-heading').text()).to.equal(`Your name`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's name`)
    })

    lab.test('full name has not been pre-filled', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.not.exist()
    })

    lab.test('full name has been pre-filled', async () => {
      const fullName = 'James Bond'
      testHelper.cache.owner = { fullName: 'James Bond' }
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.equal(fullName)
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

    lab.test('fails validation when the full name has not been entered', async () => {
      request.payload['full-name'] = ''
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(400)

      const $ = testHelper.getDomParser(response.payload)

      Code.expect($(testHelper.errorSummarySelector('full-name')).text()).to.equal('Enter your full name')
      Code.expect($(testHelper.errorMessageSelector('full-name')).text()).to.include('Enter your full name')
    })

    lab.test('redirects correctly when the full name has been entered', async () => {
      const fullName = 'James Bond'
      request.payload['full-name'] = fullName
      const response = await testHelper.server.inject(request)

      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers['location']).to.equal('/owner-address')
      Code.expect(testHelper.cache.owner.fullName).to.equal(fullName)
    })
  })
})
