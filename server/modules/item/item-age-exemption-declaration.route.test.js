const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const DeclarationHandlers = require('ivory-common-modules').declaration.handlers
const url = '/item-age-exemption-declaration'
const ageExemptionDeclaration = 'this is true'
const pageHeading = `Confirm ${ageExemptionDeclaration}`

lab.experiment(TestHelper.getFile(__filename), () => {
  let itemChoice
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      const itemType = 'portrait-miniature-pre-1918'
      const ageExemptionDescription = undefined
      TestHelper.setCache(context, 'Item', { itemType, ageExemptionDescription })

      itemChoice = {
        shortName: itemType,
        ageExemptionDeclaration
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
        { field: 'declaration', message: `Select if you declare ${ageExemptionDeclaration}` },
        { field: 'description', message: 'Enter an explanation' }
      ])
    })

    lab.test('redirects correctly', async ({ context }) => {
      const { request } = context
      const description = 'valid data'
      request.payload.description = description
      request.payload.declaration = 'ageExemptionDeclaration'
      await routesHelper.expectRedirection(context, '/item-volume-exemption-declaration')
      Code.expect(TestHelper.getCache(context, 'Item').ageExemptionDeclaration).to.equal(true)
      Code.expect(TestHelper.getCache(context, 'Item').ageExemptionDescription).to.equal(description)
    })
  })
})
