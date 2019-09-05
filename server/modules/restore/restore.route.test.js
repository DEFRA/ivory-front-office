const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const id = 'eda64615-c9c4-4047-9190-41ece7d34df3'
const url = `/restore/${id}`

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async () => {
      const request = {
        method: 'GET',
        url
      }

      await routesHelper.expectRedirection(request, '/check-your-answers')
    })
  })
})
