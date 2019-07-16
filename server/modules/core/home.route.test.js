const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  lab.test('GET / route works', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await testHelper.server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers['location']).to.equal('/who-owns-item')
  })
})
