const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab)

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async () => {
      const request = {
        method: 'GET',
        url
      }

      await testHelper.expectRedirection(request, '/who-owns-item')
    })
  })
})
