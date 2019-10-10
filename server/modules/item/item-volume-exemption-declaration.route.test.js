const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const DeclarationHandlers = require('ivory-common-modules').declaration.handlers
const url = '/item-volume-exemption-declaration'
const volumeExemptionDeclaration = 'this is true'
const pageHeading = `Confirm ${volumeExemptionDeclaration}`

lab.experiment(TestHelper.getFile(__filename), () => {
  let itemChoice
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      const itemType = 'portrait-miniature-pre-1918'
      const volumeExemptionDescription = undefined
      TestHelper.setCache(context, 'Item', { itemType, volumeExemptionDescription })

      itemChoice = {
        shortName: itemType,
        volumeExemptionDeclaration
      }

      sandbox.stub(DeclarationHandlers.prototype, 'referenceData').get(() => {
        return {
          choices: [itemChoice]
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the declaration check box has not been selected', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'declaration', message: `You must declare ${volumeExemptionDeclaration}` },
        { field: 'description', message: `You must explain how you know ${volumeExemptionDeclaration}` }
      ])
    })

    lab.test('redirects correctly', async ({ context }) => {
      const { request } = context
      const description = 'valid data'
      request.payload.description = description
      request.payload.declaration = 'volumeExemptionDeclaration'
      await routesHelper.expectRedirection(context, '/who-owns-item')
      Code.expect(TestHelper.getCache(context, 'Item').volumeExemptionDeclaration).to.equal(true)
      Code.expect(TestHelper.getCache(context, 'Item').volumeExemptionDescription).to.equal(description)
    })
  })
})
