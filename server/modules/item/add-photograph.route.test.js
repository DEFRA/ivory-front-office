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
    const files = [
      { filename: 'elephant.jpg', mimetype: 'image/jpeg' },
      { filename: 'elephant.png', mimetype: 'image/png' }
    ]

    lab.beforeEach(({ context }) => {
      context.request.headers = {
        'Content-Type': 'multipart/form-data; boundary=WebAppBoundary'
      }
    })

    files.forEach(({ filename, mimetype }) => {
      lab.test(`passes validation when uploading ${filename} `, async ({ context }) => {
        const { request } = context
        request.payload = [
          '--WebAppBoundary',
          `Content-Disposition: form-data; name="photograph"; filename="${filename}"`,
          `Content-Type: ${mimetype}`,
          '',
          'file-contents of the image'.repeat(1024 * 2),
          '--WebAppBoundary--'
        ].join('\r\n')

        await routesHelper.expectRedirection(context, '/check-photograph')
      })
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

    lab.test('fails validation when invalid content type', async ({ context }) => {
      const { request } = context
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename="elephant.pdf"',
        'Content-Type: application/pdf',
        '',
        '',
        '--WebAppBoundary--'
      ].join('\r\n')

      return routesHelper.expectValidationErrors(context, [
        { field: 'photograph', message: 'The selected file must be a JPG, JPEG or PNG' }
      ])
    })
  })
})
