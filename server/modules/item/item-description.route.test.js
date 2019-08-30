const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const TestHelper = require('../../../test-helper')
const url = '/item-description'
const pageHeading = 'Describe the item'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('description has been pre-filled when cache exists', async ({ context }) => {
      const description = 'Test item description'
      routesHelper.cache.Item = { description: description }
      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#item-description').val()).to.equal(description)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the item description has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = ''
      return routesHelper.expectValidationErrors(request, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.test('fails validation when the item description contains only spaces', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = ' '
      return routesHelper.expectValidationErrors(request, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.test('redirects correctly when the item description has been entered', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = 'Some item details'
      await routesHelper.expectRedirection(request, '/owner-name')
    })
  })
})
