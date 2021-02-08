const Boom = require('@hapi/boom')
const { utils, Payment: PaymentAPI } = require('defra-hapi-utils')
const cache = require('ivory-data-mapping').cache
const { Payment, Registration } = cache
const config = require('../../config')

class CheckPaymentHandlers extends require('../../lib/handlers/handlers') {
  get paymentApi () {
    const { paymentUrl, paymentKey } = config
    return new PaymentAPI({
      paymentsUrl: paymentUrl,
      apiKey: paymentKey
    })
  }

  async handleGet (request, h) {
    await cache.restore(request, request.params.id)
    const payment = await Payment.get(request)

    const paymentApi = this.paymentApi

    const result = await paymentApi.requestStatus(payment.paymentId)
    const status = utils.getNestedVal(result, 'state.status') || 'failed'
    payment.status = status

    if (status === 'success') {
      const registration = await Registration.get(request)
      registration.status = 'submitted'
      await Payment.set(request, payment, false)
      await Registration.set(request, registration)
      return h.redirect('/confirmation-notify')
    } else {
      const code = utils.getNestedVal(result, 'state.code')
      const message = utils.getNestedVal(result, 'state.message')
      if (code) {
        payment.code = code
        payment.message = message
        await Payment.set(request, payment)
        return h.redirect('/check-your-answers')
      }
    }

    await Payment.set(request, payment)
    return Boom.expectationFailed('Payment failed', payment)
  }
}

module.exports = CheckPaymentHandlers
