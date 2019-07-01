const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../test-helper')
const url = '/owner-address-find'

lab.experiment('Test Owner Address Find', () => {
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

    lab.experiment(`POST ${url}`, () => {
      let request

      lab.beforeEach(() => {
        request = {
          method: 'POST',
          url,
          payload: {}
        }
      })

      lab.test('fails validation when the postcode has not been entered', async () => {
        request.payload['postcode'] = ''
        const response = await testHelper.server.inject(request)
        Code.expect(response.statusCode).to.equal(400)

        const $ = testHelper.getDomParser(response.payload)

        Code.expect($(testHelper.errorSummarySelector('postcode')).text()).to.equal('Enter a valid postcode')
        Code.expect($(testHelper.errorMessageSelector('postcode')).text()).to.include('Enter a valid postcode')
      })

      lab.test('redirects correctly when the postcode has been entered', async () => {
        request.payload['postcode'] = 'SN14 6QX'
        const response = await testHelper.server.inject(request)

        Code.expect(response.statusCode).to.equal(302)
        Code.expect(response.headers['location']).to.equal('/owner-address-select')
      })
    })
  })
})
