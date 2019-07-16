const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/who-owns-item'

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

      Code.expect($('#defra-page-heading').text()).to.equal('Who owns the item?')
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

    lab.test('fails validation when who owns the item has not been selected', async () => {
      const response = await testHelper.server.inject(request)
      Code.expect(response.statusCode).to.equal(400)

      const $ = testHelper.getDomParser(response.payload)

      Code.expect($(testHelper.errorSummarySelector('who-owns-item')).text()).to.equal('Select who owns the item')
      Code.expect($(testHelper.errorMessageSelector('who-owns-item')).text()).to.include('Select who owns the item')
    })

    lab.test('redirects correctly when who owns the item has been selected as someone else', async () => {
      request.payload['who-owns-item'] = false
      const response = await testHelper.server.inject(request)

      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers['location']).to.equal('/agent')
      Code.expect(testHelper.cache.item.ownerIsAgent).to.equal(false)
    })

    lab.test('redirects correctly when who owns the item has been selected as themselves', async () => {
      request.payload['who-owns-item'] = true
      await testHelper.expectRedirection(request, '/owner-name')
      Code.expect(testHelper.cache.item.ownerIsAgent).to.equal(true)
    })
  })
})
