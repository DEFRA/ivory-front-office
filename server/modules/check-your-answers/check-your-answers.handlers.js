const Boom = require('@hapi/boom')
const registrationNumberGenerator = require('../../lib/registration-number-generator')
const { routeFlow } = require('defra-hapi-modules').plugins
let flow
const config = require('../../config')
const cache = require('ivory-data-mapping').cache
const {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item
} = cache

class CheckYourAnswersHandlers extends require('defra-hapi-plugin-handlers') {
  static getReference (group, shortName) {
    return config.referenceData[group].choices.find((choice) => choice.shortName === shortName)
  }

  async restoreRegistration (request) {
    // Clear the cache and restore a previous registration
    const registration = await Registration.get(request) || {}
    return cache.restore(request, registration.id)
  }

  async isOwner (request) {
    const { ownerType } = await Registration.get(request) || {}
    return ownerType === 'i-own-it'
  }

  getPerson (person, address, prefix = 'Your', personLink, addressLink, emailLink) {
    if (typeof prefix !== 'object') {
      prefix = { default: prefix }
    }
    const answers = []
    if (person.fullName) {
      answers.push({
        key: `${prefix.name || prefix.default} name`,
        value: person.fullName,
        link: personLink
      })
    }

    if (address.addressLine) {
      answers.push({
        key: `${prefix.address || prefix.default} address`,
        html: address.addressLine.split(',').join('<br>'),
        link: addressLink
      })
    }

    if (person.email) {
      answers.push({
        key: `${prefix.email || prefix.default} email`,
        value: person.email,
        link: emailLink
      })
    }

    return answers
  }

  getExemption (heading, declaration, description, reference, link) {
    const answers = []

    if (declaration) {
      answers.push({
        key: heading,
        html: `
            <span class="ivory-declaration">I declare ${reference}</span>
            <br><br>
            Other supporting evidence:
            <br><br>
            <span class="ivory-explanation">${description.replace(/[\r]/g, '<br>')}</span>
        `,
        link
      })
    }

    return answers
  }

  buildRows (answers) {
    return answers.map(({ key, value, html, link }) => {
      const classes = `ivory-${key.toLowerCase().split(' ').join('-')}`
      const row = {
        key: { text: key }
      }

      if (value) {
        row.value = { classes, text: value }
      } else if (html) {
        row.value = { classes, html }
      }

      if (config.changeYourAnswersEnabled) {
        row.actions = {
          items: [
            {
              href: link,
              text: 'Change',
              visuallyHiddenText: key.toLowerCase()
            }
          ]
        }
      }

      return row
    })
  }

  async handleGet (request, h, errors) {
    flow = flow || routeFlow.flow()
    const registration = await this.restoreRegistration(request)

    const owner = await Owner.get(request) || {}
    const ownerAddress = await OwnerAddress.get(request) || {}
    const agent = await Agent.get(request) || {}
    const agentAddress = await AgentAddress.get(request) || {}
    const item = await Item.get(request) || {}
    const { dealingIntent, ownerType } = registration
    const { itemType } = item

    let answers = []

    const itemTypeReference = CheckYourAnswersHandlers.getReference('itemType', itemType)

    if (itemTypeReference) {
      answers.push({
        key: 'Item type',
        value: itemTypeReference.label,
        link: flow['item-type'].path
      })
    }

    // TODO: Handle multiple photos
    if (item.photos) {
      // item.photos.forEach((photo) => {
      const lastphoto = item.photos[item.photos.length - 1] // Until we handle multiple photos, take the last photo
      answers.push({
        key: 'Photograph',
        html: `<img class="check-photo-img" src="/photos/medium/${lastphoto.filename}" border="0">`,
        link: flow['check-photograph'].path
      })
      // })
    }

    if (item.description) {
      answers.push({
        key: 'Description',
        html: item.description.replace(/[\r]/g, '<br>'),
        link: flow['item-description'].path
      })
    }

    if (item.ageExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Age of Ivory',
        item.ageExemptionDeclaration,
        item.ageExemptionDescription,
        itemTypeReference.ageExemptionDeclaration,
        flow['item-age-exemption-declaration'].path))
    }

    if (item.volumeExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Volume of Ivory',
        item.volumeExemptionDeclaration,
        item.volumeExemptionDescription,
        itemTypeReference.volumeExemptionDeclaration,
        flow['item-volume-exemption-declaration'].path))
    }

    if (ownerType) {
      const { label } = CheckYourAnswersHandlers.getReference('ownerType', ownerType)
      answers.push({
        key: 'Who owns the item',
        value: label,
        link: flow['who-owns-item'].path
      })
    }

    if (agent.fullName) {
      answers = answers.concat(this.getPerson(agent, agentAddress,
        { name: 'Contact', default: 'Your' },
        flow['agent-name'].path, flow['agent-address-find'].path, flow['agent-email'].path))
    }

    if (owner.fullName) {
      answers = answers.concat(this.getPerson(owner, ownerAddress,
        await this.isOwner(request) ? 'Your' : 'Owner\'s',
        flow['owner-name'].path, flow['owner-address-find'].path, flow['owner-email'].path))
    }

    if (dealingIntent) {
      const { display } = CheckYourAnswersHandlers.getReference('dealingIntent', dealingIntent)
      answers.push({
        key: 'Intention',
        value: display,
        link: flow['dealing-intent'].path
      })
    }

    this.viewData = { rows: this.buildRows(answers) }

    return super.handleGet(request, h, errors)
  }

  async handlePost (request, h) {
    const registration = await this.restoreRegistration(request)

    if (!registration.validForPayment) {
      return Boom.badData('Registration not valid for payment', registration)
    }

    if (!registration.registrationNumber) {
      registration.registrationNumber = await registrationNumberGenerator.get()
    }
    await Registration.set(request, registration)
    return super.handlePost(request, h)
  }
}

module.exports = CheckYourAnswersHandlers
