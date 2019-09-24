const Boom = require('@hapi/boom')
const { utils, Cache, Payment: PaymentAPI } = require('ivory-shared')
const { Payment, Registration } = require('../../lib/cache')
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

    if (status === 'success') {
      const registration = await Registration.get(request)
      registration.status = 'submitted'
      await Payment.set(request, payment, false)
      await Registration.set(request, registration)
      return h.redirect('/confirmation')
    } else {
      await Payment.set(request, payment)
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
