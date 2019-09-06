const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const url = '/dealing-intent'
const pageHeading = 'What do you plan to do with the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'sell', value: 'sell' },
          { shortName: 'hire', value: 'hire' }
        ]
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      const { request } = context
      return routesHelper.expectValidationErrors(request, [
        { field: 'dealingIntent', message: 'Select what you plan to do with the item' }
      ])
    })

    lab.test('redirects correctly when "Sell it" is selected', async ({ context }) => {
      const { request } = context
      request.payload.dealingIntent = 'sell'
      await routesHelper.expectRedirection(request, '/check-your-answers')
      Code.expect(routesHelper.cache.Registration.dealingIntent).to.equal('sell')
    })

    lab.test('redirects correctly when "Hire it out" is selected', async ({ context }) => {
      const { request } = context
      request.payload.dealingIntent = 'hire'
      await routesHelper.expectRedirection(request, '/check-your-answers')
      Code.expect(routesHelper.cache.Registration.dealingIntent).to.equal('hire')
    })
  })
})
