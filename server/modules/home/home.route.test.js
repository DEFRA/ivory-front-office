const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async ({ context }) => {
      context.request = {
        method: 'GET',
        url
      }

      await routesHelper.expectRedirection(context, '/item-type')
    })
  })
})
