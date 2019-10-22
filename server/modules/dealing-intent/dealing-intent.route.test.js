const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SingleOptionHandlers = require('ivory-common-modules').option.single.handlers
const url = '/dealing-intent'
const pageHeading = 'What do you plan to do with the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(SingleOptionHandlers.prototype, 'referenceData').get(() => {
        return {
          choices: [
            { shortName: 'sell', value: 'sell' },
            { shortName: 'hire', value: 'hire' }
          ]
        }
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'dealingIntent', message: 'Select if you want to sell or hire it' }
      ])
    })

    lab.test('redirects correctly when "Sell it" is selected', async ({ context }) => {
      const { request } = context
      request.payload.dealingIntent = 'sell'
      await routesHelper.expectRedirection(context, '/check-your-answers')
      Code.expect(TestHelper.getCache(context, 'Registration').dealingIntent).to.equal('sell')
    })

    lab.test('redirects correctly when "Hire it out" is selected', async ({ context }) => {
      const { request } = context
      request.payload.dealingIntent = 'hire'
      await routesHelper.expectRedirection(context, '/check-your-answers')
      Code.expect(TestHelper.getCache(context, 'Registration').dealingIntent).to.equal('hire')
    })
  })
})
