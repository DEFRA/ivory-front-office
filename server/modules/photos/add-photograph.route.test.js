
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/add-photograph'
const pageHeading = 'Add a photo'
const alternativePageHeading = 'Add another photo'
const config = require('../../config')
const { Photos } = require('defra-hapi-photos')

const getPhotos = (count) => {
  const photos = []
  for (let index = 0; index < count; index++) {
    photos.push({ filename: `elephant-${index + 1}` })
  }
  return photos
}

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 's3Enabled').value(false) // Not needed in these tests
      sandbox.stub(config, 's3Region').value('REGION')
      sandbox.stub(config, 's3ApiVersion').value('APIVERSION')
      sandbox.stub(config, 's3Bucket').value('BUCKET')

      // Stub the photos.upload function here, so we can override it in later tests
      context.sandbox.photosUploadStub = context.sandbox.stub(Photos.prototype, 'upload').value(() => {
        return {
          promise: async () => {}
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('alternative page heading is correct', async ({ context }) => {
      // Simulate that one less than the maximum photos have been updated already
      TestHelper.setCache(context, 'Item', { photos: getPhotos(config.photoUploadMaxPhotos - 1) })

      const { server } = context
      const response = await server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text()).to.include(alternativePageHeading)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    const files = [
      { filename: 'elephant.jpg', mimetype: 'image/jpeg' },
      { filename: 'elephant.png', mimetype: 'image/png' }
    ]

    lab.beforeEach(({ context }) => {
      context.request.headers = {
        'Content-Type': 'multipart/form-data; boundary=WebAppBoundary'
      }
      // Simulate that one less than the maximum photos have been updated already
      TestHelper.setCache(context, 'Item', { photos: getPhotos(config.photoUploadMaxPhotos - 1) })
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

        await routesHelper.expectRedirection(context, '/manage-photographs')
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
        { field: 'photograph', message: `The selected file must be bigger than ${config.photoUploadPhotoMinKb}KB` }
      ])
    })

    lab.test('fails validation when the number of photos exceeds the maximum', async ({ context }) => {
      const { request } = context
      TestHelper.setCache(context, 'Item', { photos: getPhotos(config.photoUploadMaxPhotos) })
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename="elephant.jpg"',
        'Content-Type: image/jpeg',
        '',
        'file-contents of the image'.repeat(1024 * 2),
        '--WebAppBoundary--'
      ].join('\r\n')

      return routesHelper.expectValidationErrors(context, [
        { field: 'photograph', message: `Only a maximum of ${config.photoUploadMaxPhotos} files can be uploaded – try again` }
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

    lab.test('fails validation when the upload fails', async ({ context }) => {
      const { request } = context
      request.payload = [
        '--WebAppBoundary',
        'Content-Disposition: form-data; name="photograph"; filename="elephant.jpg"',
        'Content-Type: image/jpeg',
        '',
        'file-contents of the image'.repeat(1024 * 2),
        '--WebAppBoundary--'
      ].join('\r\n')

      // Stub the Photos.upload() to throw an error
      context.sandbox.photosUploadStub.value(async () => {
        throw new Error('upload failed from stub')
      })

      return routesHelper.expectValidationErrors(context, [
        { field: 'photograph', message: 'The selected file could not be uploaded – try again' }
      ])
    })
  })
})
