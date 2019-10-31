const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SingleOptionHandlers = require('../common/single-option-handlers')
const url = '/item-type'
const pageHeading = 'What type of item are you registering?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(SingleOptionHandlers.prototype, 'referenceData').get(() => {
        return {
          choices: [
            { shortName: 'portrait-miniature-pre-1918', value: 'portrait-miniature-pre-1918' }
          ]
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'itemType', message: 'Select the type of item it is' }
      ])
    })

    lab.test('redirects correctly', async ({ context }) => {
      const { request } = context
      request.payload.itemType = 'portrait-miniature-pre-1918'
      await routesHelper.expectRedirection(context, '/add-photograph')
      Code.expect(TestHelper.getCache(context, 'Item').itemType).to.equal('portrait-miniature-pre-1918')
    })
  })
})
