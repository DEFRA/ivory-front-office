const Boom = require('@hapi/boom')
const { utils, Cache, Payment: PaymentAPI } = require('ivory-shared')
const { Payment } = require('../../lib/cache')
const { paymentUrl, paymentKey } = require('../../config')
const syncRegistration = require('../../lib/sync-registration')

class RestoreHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)
    const { id } = request.params
    await syncRegistration.restore(request, id)
    const payment = await Payment.get(request)

    const paymentApi = new PaymentAPI({
      paymentsUrl: paymentUrl,
      apiKey: paymentKey
    })

    const result = await paymentApi.requestStatus(payment.paymentId)
    const status = utils.getNestedVal(result, 'state.status') || 'failed'
    payment.status = status
    await Payment.set(request, payment)

    if (status === 'success') {
      return h.redirect('/confirmation')
    }

    return Boom.expectationFailed('Payment failed', payment)
  }
}

const handlers = new RestoreHandlers()

module.exports = handlers.routes({
  path: '/check-payment/{id}',
  app: {
    tags: ['always']
  }
})
