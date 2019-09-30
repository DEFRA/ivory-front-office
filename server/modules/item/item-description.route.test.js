const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const TestHelper = require('../../../test-helper')
const config = require('../../config')
const url = '/item-description'
const pageHeading = 'Describe the item'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('description has been pre-filled when cache exists', async ({ context }) => {
      const { request, server } = context
      const description = 'Test item description'
      TestHelper.setCache(context, 'Item', { description })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#item-description').val()).to.equal(description)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    let itemChoice

    lab.beforeEach(({ context }) => {
      const { sandbox } = context
      const itemType = 'portrait-miniature-pre-1918'

      TestHelper.setCache(context, 'Item', { itemType })
      itemChoice = { shortName: itemType }

      sandbox.stub(config, 'referenceData').get(() => {
        return {
          itemType: {
            choices: [itemChoice]
          }
        }
      })
    })

    lab.test('fails validation when the item description has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = ''
      return routesHelper.expectValidationErrors(context, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.test('fails validation when the item description contains only spaces', async ({ context }) => {
      const { request } = context
      request.payload['item-description'] = ' '
      return routesHelper.expectValidationErrors(context, [
        { field: 'item-description', message: 'Enter a description of the item' }
      ])
    })

    lab.experiment('redirects correctly when the item description has been entered', () => {
      lab.beforeEach(({ context }) => {
        const { request } = context
        request.payload['item-description'] = 'Some item details'
      })

      lab.test('and no exemption declarations are required', async ({ context }) => {
        await routesHelper.expectRedirection(context, '/owner-name')
      })

      lab.test('exemption declarations are required', async ({ context }) => {
        itemChoice.ageExemptionDeclaration = 'age-exemption-declaration'
        await routesHelper.expectRedirection(context, '/item-age-exemption-declaration')
      })
    })
  })
})
