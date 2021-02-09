const { logger } = require('defra-logging-facade')
const moment = require('moment')
const { Registration, Agent, Owner } = require('../../lib/data-mapping/index').cache
const config = require('../../config')

const NotifyClient = require('notifications-node-client').NotifyClient

class ConfirmationHandlers extends require('../../lib/handlers/handlers') {
  async notifyRegistration (contact, registrationNumber, registrationId) {
    const { notifyApiKey, notifyConfirmationTemplateId, notifyEmailReplyToId, serviceUrl } = config
    const { fullName, email: emailAddress } = contact || {}
    const reference = registrationNumber + Date.now()
    const personalisation = {
      registrationNumber,
      fullName,
      link_to_document: `${serviceUrl}/restore/${registrationId}`
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
    const { registrationNumber, id: registrationId } = registration || {}
    if (config.notifyEnabled) {
      const result = await this.notifyRegistration(contact, registrationNumber, registrationId)
      if (result.error) {
        logger.error('Failed to send confirmation email:', result.error)
      } else {
        registration.confirmationSent = true
      }
    }

    registration.submittedDate = moment().format('YYYY-MM-DDTHH:mm:ss.000Z')

    await Registration.set(request, registration)
    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }
}

module.exports = ConfirmationHandlers
