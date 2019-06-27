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

  lab.test('GET / route works', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
})
