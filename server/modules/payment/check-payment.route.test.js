const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const { Payment: PaymentAPI } = require('defra-hapi-utils')
const { Payment, Registration } = require('ivory-data-mapping').cache
const config = require('../../config')
const { uuid } = require('defra-hapi-utils').utils
const id = 'eda64615-c9c4-4047-9190-41ece7d34df3'
const url = `/check-payment/${id}`

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      TestHelper.setCache(context, 'Registration', { registrationNumber: 'abc' })
      sandbox.stub(config, 'paymentUrl').value('http://fake.com')
      sandbox.stub(config, 'paymentKey').value('key')
      sandbox.stub(Payment, 'set').value(() => {})
      sandbox.stub(Payment, 'get').value(() => {
        return { paymentId: 'payment-id' }
      })
      sandbox.stub(Registration, 'set').value(() => {})
      sandbox.stub(Registration, 'get').value(() => {
        return {}
      })
      sandbox.stub(PaymentAPI, 'constructor').value(() => { return {} })
      sandbox.stub(PaymentAPI.prototype, 'requestStatus').value(() => {
        return {
          state: {
            status: 'success'
          }
        }
      })
    }
  })

  const registrationId = uuid()

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async ({ context }) => {
      context.request = {
        method: 'GET',
        url
      }
      TestHelper.setCache(context, 'Registration', { id: registrationId, registrationNumber: 'abc' })

      await routesHelper.expectRedirection(context, '/confirmation-notify')
    })
  })
})
