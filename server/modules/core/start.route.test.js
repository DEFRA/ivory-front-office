const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()

lab.experiment('Web test', () => {
  let server

  // Create server before the tests
  lab.before(async () => {
    process.env.ADDRESS_LOOKUP_ENABLED = false
    process.env.AIRBRAKE_ENABLED = false
    server = await require('../../../server')()
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
