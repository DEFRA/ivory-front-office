const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SingleOptionHandlers = require('../common/option/single/single-option.handlers')
const pageHeading = 'How are you acting on behalf of the owner?'
const url = '/agent'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(SingleOptionHandlers.prototype, 'referenceData').get(() => {
        return {
          choices: [
            { shortName: 'executor', value: 'executor' },
            { shortName: 'trustee', value: 'trustee' }
          ]
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when nothing is selected', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'agentActingAs', message: 'Select how you are acting on behalf of the owner' }
      ])
    })

    lab.test('redirects correctly when "Executor" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'executor'
      await routesHelper.expectRedirection(context, '/agent-name')
      Code.expect(TestHelper.getCache(context, 'Registration').agentActingAs).to.equal('executor')
    })

    lab.test('redirects correctly when "Trustee" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'trustee'
      await routesHelper.expectRedirection(context, '/agent-name')
      Code.expect(TestHelper.getCache(context, 'Registration').agentActingAs).to.equal('trustee')
    })
  })
})
