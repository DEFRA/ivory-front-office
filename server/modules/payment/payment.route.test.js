const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const { Payment } = require('ivory-shared')
const config = require('../../config')
const { uuid } = require('ivory-shared').utils
const url = '/payment'

lab.experiment(TestHelper.getFile(__filename), () => {
  let returnUrl
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(config, 'paymentEnabled').value(true)
      sandbox.stub(config, 'paymentUrl').value('http://fake.com')
      sandbox.stub(config, 'paymentAmount').value(10)
      sandbox.stub(config, 'paymentKey').value('key')
      sandbox.stub(Payment.prototype, 'requestPayment').value(() => {
        return {
          state: {
            status: 'created'
          },
          _links: {
            next_url: {
              href: returnUrl
            }
          }
        }
      })
    }
  })

  const registrationId = uuid()

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async () => {
      const request = {
        method: 'GET',
        url
      }

      returnUrl = routesHelper.server.info.uri + '/check-payment/' + registrationId

      routesHelper.cache.Registration = { id: registrationId, registrationNumber: 'abc' }

      await routesHelper.expectRedirection(request, returnUrl)
    })
  })
})
