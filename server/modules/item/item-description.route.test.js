const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/item-description'

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

      Code.expect($('#defra-page-heading').text()).to.equal('Item description')
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

    lab.test('fails validation when the item description has not been entered', async () => {
      request.payload['item-description'] = ''
      return testHelper.expectValidationErrors(request, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.test('redirects correctly when the item description has been entered', async () => {
      request.payload['item-description'] = 'Some item details'
      await testHelper.expectRedirection(request, '/check-your-answers')
    })
  })
})
