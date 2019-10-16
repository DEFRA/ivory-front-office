const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/add-photograph'
const pageHeading = 'Add a photo'
const config = require('../../config')

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 's3Region').value('REGION')
      sandbox.stub(config, 's3ApiVersion').value('APIVERSION')
      sandbox.stub(config, 's3Bucket').value('BUCKET')
    }
  })

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
        'file-contents of the image'.repeat(1024 * 2),
        '--WebAppBoundary--'
      ].join('\r\n')

      await routesHelper.expectRedirection(context, '/check-photograph')
    })

    lab.test('fails validation when photo is too small', async ({ context }) => {
      const { request } = context
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename="elephant.jpg"',
        'Content-Type: image/jpeg',
        '',
        'file-contents of the image',
        '--WebAppBoundary--'
      ].join('\r\n')

      return routesHelper.expectValidationErrors(context, [
        { field: 'photograph', message: 'The selected file must be bigger than 50KB' }
      ])
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

      return routesHelper.expectValidationErrors(context, [
        { field: 'photograph', message: 'You must add a photo' }
      ])
    })
  })
})
