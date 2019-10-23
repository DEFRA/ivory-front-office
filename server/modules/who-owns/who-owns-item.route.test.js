const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SingleOptionHandlers = require('ivory-common-modules').option.single.handlers
const url = '/who-owns-item'
const pageHeading = 'Who owns the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(SingleOptionHandlers.prototype, 'referenceData').get(() => {
        return {
          choices: [
            { shortName: 'agent', value: 'agent' },
            { shortName: 'someone-else', value: 'someone-else' }
          ]
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'ownerType', message: 'Select if you own it or someone else owns it' }
      ])
    })

    lab.test('redirects correctly when "I own it" is selected', async ({ context }) => {
      const { request } = context
      request.payload.ownerType = 'agent'
      await routesHelper.expectRedirection(context, '/owner-name')
      Code.expect(TestHelper.getCache(context, 'Registration').ownerType).to.equal('agent')
    })

    lab.test('redirects correctly when "someone else" is selected', async ({ context }) => {
      const { request } = context
      request.payload.ownerType = 'someone-else'
      await routesHelper.expectRedirection(context, '/agent-name')
      Code.expect(TestHelper.getCache(context, 'Registration').ownerType).to.equal('someone-else')
    })
  })
})
