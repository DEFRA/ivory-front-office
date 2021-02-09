const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const id = 'eda64615-c9c4-4047-9190-41ece7d34df3'
const url = `/restore/${id}`
const { Registration } = require('../../lib/data-mapping/index').cache

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(Registration, 'get').value(() => {
        return { id, registrationNumber: 'abc', status: 'submitted' }
      })
    }
  })

  lab.beforeEach(({ context }) => {
    context.request = {
      method: 'GET',
      url
    }
  })

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async ({ context }) => {
      await routesHelper.expectRedirection(context, '/registration-document')
    })
  })
})
