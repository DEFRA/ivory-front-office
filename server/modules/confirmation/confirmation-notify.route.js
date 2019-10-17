const { logger } = require('defra-logging-facade')
const { Registration, Agent, Owner } = require('../../lib/cache')
const { notifyEnabled, notifyApiKey, notifyConfirmationTemplateId, notifyEmailReplyToId } = require('../../config')

const NotifyClient = require('notifications-node-client').NotifyClient

class ConfirmationHandlers extends require('ivory-common-modules').handlers {
  async notifyRegistration (contact, registrationNumber) {
    const { fullName, email: emailAddress } = contact || {}
    const reference = registrationNumber + Date.now()
    const personalisation = {
      registrationNumber,
      fullName
    }
    const emailReplyToId = notifyEmailReplyToId
    const notifyClient = new NotifyClient(notifyApiKey)
    try {
      return await notifyClient
        .sendEmail(notifyConfirmationTemplateId, emailAddress, {
          // email_address: emailAddress,
          personalisation,
          reference,
          emailReplyToId
        })
    } catch (err) {
      return err
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h) {
    const [registration, agent, owner] = await Promise.all([
      Registration.get(request),
      Agent.get(request),
      Owner.get(request)
    ])
    const contact = agent || owner
    const { registrationNumber } = registration || {}
    if (notifyEnabled) {
      const result = await this.notifyRegistration(contact, registrationNumber)
      if (result.error) {
        logger.error('Failed to send confirmation email:', result.error)
      } else {
        registration.confirmationSent = true
        await Registration.set(request, registration)
      }
    }
    return h.redirect('/confirmation')
  }
}

const handlers = new ConfirmationHandlers()

module.exports = handlers.routes({
  path: '/confirmation-notify',
  app: {
    tags: ['submitted']
  }
})
