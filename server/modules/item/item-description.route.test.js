const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/item-description'
const pageHeading = 'Item description'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the item description has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = ''
      return routesHelper.expectValidationErrors(request, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.test('redirects correctly when the item description has been entered', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = 'Some item details'
      await routesHelper.expectRedirection(request, '/check-your-answers')
    })
  })
})
