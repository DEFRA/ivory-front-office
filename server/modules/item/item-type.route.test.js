const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const url = '/item-type'
const pageHeading = 'What type of item are you registering?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'portrait-miniature-pre-1918', value: 'portrait-miniature-pre-1918' }
        ]
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      const { request } = context
      return routesHelper.expectValidationErrors(request, [
        { field: 'itemType', message: 'Select what type of item you are registering' }
      ])
    })

    lab.test('redirects correctly', async ({ context }) => {
      const { request } = context
      request.payload.itemType = 'portrait-miniature-pre-1918'
      await routesHelper.expectRedirection(request, '/add-photograph')
      Code.expect(routesHelper.cache.Item.itemType).to.equal('portrait-miniature-pre-1918')
    })
  })
})
