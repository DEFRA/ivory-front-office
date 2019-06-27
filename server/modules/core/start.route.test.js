const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../test-helper')

lab.experiment('Web test', () => {
  let server

  // Create server before the tests
  lab.before(async () => {
    server = await TestHelper.createServer()
  })

  lab.test('GET /start route works', async () => {
    const options = {
      method: 'GET',
      url: '/start'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers['location']).to.equal('/owner-name')
  })
})
