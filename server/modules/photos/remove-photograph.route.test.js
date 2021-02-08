const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const TestHelper = require('../../../test-helper')
const id = 'eda64615-c9c4-4047-9190-41ece7d34df3'
const url = `/remove-photograph/${id}`
const pageHeading = 'Remove a photo'
const config = require('../../config')
const hapiPhotos = require('../../plugins/photos/index')

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const photos = [{ id, filename: '1234567890.jpg' }]
      TestHelper.setCache(context, 'Item', { photos })
      const { sandbox } = context
      sandbox.stub(config, 's3Enabled').value(false) // Not needed in these tests
      sandbox.stub(config, 's3Region').value('REGION')
      sandbox.stub(config, 's3ApiVersion').value('APIVERSION')
      sandbox.stub(config, 's3Bucket').value('BUCKET')

      // Stub the hapiPhotos.delete function
      context.sandbox.stub(hapiPhotos, 'getPhotos').value(() => {
        return { delete: () => {} }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('photo url is correct', async ({ context }) => {
      const photos = [{ id, filename: '1234567890.jpg' }]
      TestHelper.setCache(context, 'Item', { photos })
      const response = await context.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)
      const photographSrc = $('#photograph')[0].attribs.src

      Code.expect(photographSrc).to.equal(`/photos/medium/${photos[0].filename}`)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.experiment('click continue to remove photo and check redirection', () => {
      lab.test('when photos still exist', async ({ context }) => {
        const photos = [{ id, filename: '1234567890.jpg' }, { id: 'sadasdasda', filename: 'sdfsdfsdf.jpg' }]
        TestHelper.setCache(context, 'Item', { photos })
        await routesHelper.expectRedirection(context, '/manage-photographs')
      })

      lab.test('when there are no photos left', async ({ context }) => {
        const photos = [{ id, filename: '1234567890.jpg' }]
        TestHelper.setCache(context, 'Item', { photos })
        await routesHelper.expectRedirection(context, '/add-photograph')
      })
    })
  })
})
