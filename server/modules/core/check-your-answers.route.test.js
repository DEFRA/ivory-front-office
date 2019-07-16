const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/check-your-answers'

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

      Code.expect($('#defra-page-heading').text()).to.equal(`Check your answers`)
    })

    lab.test('page answers are displayed correctly', async () => {
      const fullName = 'James Bond'
      const addressLine = 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
      const description = 'A violin bow with an ivory tip.'

      Object.assign(testHelper.cache, {
        owner: { fullName },
        'owner-address': { addressLine },
        item: { description }
      })

      const response = await testHelper.server.inject(request)
      const $ = testHelper.getDomParser(response.payload)

      Code.expect($('#owner-full-name').text()).to.include(fullName)
      Code.expect($('#owner-address-line').text()).to.include(addressLine)
      Code.expect($('#item-description').text()).to.include(description)
    })
  })
})
