const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const TestHelper = require('../../../test-helper')
const url = '/manage-photographs'
const pageHeading = 'Your photos'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('photo url is correct', async ({ context }) => {
      const photos = [{ filename: '1234567890.jpg' }]
      TestHelper.setCache(context, 'Item', { photos })
      const response = await context.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)
      const photographSrc = $('.your-photos-img')[0].attribs.src

      Code.expect(photographSrc).to.equal(`/photos/medium/${photos[0].filename}`)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('click continue and redirect to next page', async ({ context }) => {
      await routesHelper.expectRedirection(context, '/item-description')
    })
  })
})
