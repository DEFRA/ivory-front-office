const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/add-photograph'
const pageHeading = 'Add a photo'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.beforeEach(({ context }) => {
      context.request.headers = {
        'Content-Type': 'multipart/form-data; boundary=WebAppBoundary'
      }
    })

    lab.test('passes validation', async ({ context }) => {
      const { request } = context
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename="elephant.jpg"',
        'Content-Type: image/jpeg',
        '',
        'file-contents of the image',
        '--WebAppBoundary--'
      ].join('\r\n')

      await routesHelper.expectRedirection(request, '/check-photograph')
    })

    lab.test('fails validation when no photo selected', async ({ context }) => {
      const { request } = context
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename=""',
        'Content-Type: application/octet-stream',
        '',
        '',
        '--WebAppBoundary--'
      ].join('\r\n')

      return routesHelper.expectValidationErrors(request, [
        { field: 'photograph', message: 'Select a photograph' }
      ])
    })
  })
})
