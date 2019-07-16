const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/agent'

const validSelections = ['professional-advisor', 'executor', 'trustee', 'friend-or-relative']

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url
      }
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct', async () => {
      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal('How are you acting on behalf of the owner?')
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

    lab.test('fails validation when nothing is selected', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(400)

      const $ = testHelper.getDomParser(response.payload)

      Code.expect($(testHelper.errorSummarySelector('agentActingAs')).text()).to.equal('Select how you acting on behalf of the owner')
      Code.expect($(testHelper.errorMessageSelector('agentActingAs')).text()).to.include('Select how you acting on behalf of the owner')
    })

    validSelections.forEach((selection) => {
      lab.test(`redirects correctly when ${selection} has been selected`, async () => {
        request.payload['agentActingAs'] = selection
        const response = await testHelper.server.inject(request)

        Code.expect(response.statusCode).to.equal(302)
        Code.expect(response.headers['location']).to.equal('/owner-name')
        Code.expect(testHelper.cache.agent.actingAs).to.equal(selection)
      })
    })
  })
})
