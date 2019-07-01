const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../test-helper')
const url = '/owner-address-select'

lab.experiment('Test Owner Name', () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url
      }
    })

    lab.test('page loads ok', async () => {
      const response = await testHelper.server.inject(getRequest)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.headers['content-type']).to.include('text/html')
    })

    lab.test('page heading is correct when no agent', async () => {
      const response = await testHelper.server.inject(getRequest)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Your address`)
    })

    lab.test('page heading is correct when there is an agent', async () => {
      testHelper.cache.agent = {}
      const response = await testHelper.server.inject(getRequest)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#defra-page-heading').text()).to.equal(`Owner's address`)
    })
  })
})
