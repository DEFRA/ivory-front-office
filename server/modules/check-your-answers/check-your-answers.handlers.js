const Boom = require('@hapi/boom')
const config = require('../../config')
const cache = require('../../lib/data-mapping/index').cache
const {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item
} = cache

class CheckYourAnswersHandlers extends require('../../lib/handlers/handlers') {
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

  getPerson (person, address, prefix = 'Your', personRoute, addressRoute, emailRoute) {
    if (typeof prefix !== 'object') {
      prefix = { default: prefix }
    }
    const answers = []
    if (person.fullName) {
      answers.push({
        key: `${prefix.name || prefix.default} name`,
        value: person.fullName,
        route: personRoute
      })
    }

    if (address.addressLine) {
      answers.push({
        key: `${prefix.address || prefix.default} address`,
        html: address.addressLine.split(',').join('<br>'),
        route: addressRoute
      })
    }

    if (person.email) {
      answers.push({
        key: `${prefix.email || prefix.default} email`,
        value: person.email,
        route: emailRoute
      })
    }

    return answers
  }

  getExemption (heading, declaration, description, reference, route) {
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
        route
      })
    }

    return answers
  }

  buildRows (answers) {
    return answers.map(({ key, value, html, route = {} }) => {
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
              attributes: {
                id: `change-${route.id}`
              },
              href: route.path,
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
    const { flow } = request.server.app
    const registration = await this.restoreRegistration(request)

    const owner = await Owner.get(request) || {}
    const ownerAddress = await OwnerAddress.get(request) || {}
    const agent = await Agent.get(request) || {}
    const agentAddress = await AgentAddress.get(request) || {}
    const item = await Item.get(request) || {}
    const { dealingIntent, ownerType } = registration
    const { itemType, photos = [] } = item

    let answers = []

    const itemTypeReference = CheckYourAnswersHandlers.getReference('itemType', itemType)

    if (itemTypeReference) {
      answers.push({
        key: 'Item type',
        value: itemTypeReference.label,
        route: await flow('item-type')
      })
    }

    const html = `
        <ol class="govuk-list govuk-list--number">
            ${photos.map((photo, index) => `
            <li class="check-photo">
                <img id="check-photo-img-${index + 1}" class="check-photo-img" src="/photos/medium/${photo.filename}" alt="${photo.originalFilename}">
            </li>
            `).join('\n')}
        </ol>
`
    answers.push({
      key: 'Photographs',
      html,
      route: await flow('manage-photographs')
    })

    if (item.description) {
      answers.push({
        key: 'Description',
        html: item.description.replace(/[\r]/g, '<br>'),
        route: await flow('item-description')
      })
    }

    if (item.ageExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Age of Ivory',
        item.ageExemptionDeclaration,
        item.ageExemptionDescription,
        itemTypeReference.ageExemptionDeclaration,
        await flow('item-age-exemption-declaration')))
    }

    if (item.volumeExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Volume of Ivory',
        item.volumeExemptionDeclaration,
        item.volumeExemptionDescription,
        itemTypeReference.volumeExemptionDeclaration,
        await flow('item-volume-exemption-declaration')))
    }

    if (ownerType) {
      const { label } = CheckYourAnswersHandlers.getReference('ownerType', ownerType)
      answers.push({
        key: 'Who owns the item',
        value: label,
        route: await flow('who-owns-item')
      })
    }

    if (agent.fullName) {
      answers = answers.concat(this.getPerson(agent, agentAddress,
        { name: 'Contact', default: 'Your' },
        await flow('agent-name'), await flow('agent-address-find'), await flow('agent-email')))
    }

    if (owner.fullName) {
      answers = answers.concat(this.getPerson(owner, ownerAddress,
        await this.isOwner(request) ? 'Your' : 'Owner\'s',
        await flow('owner-name'), await flow('owner-address-find'), await flow('owner-email')))
    }

    if (dealingIntent) {
      const { display } = CheckYourAnswersHandlers.getReference('dealingIntent', dealingIntent)
      answers.push({
        key: 'Intention',
        value: display,
        route: await flow('dealing-intent')
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

    registration.status = 'ready-for-payment'

    await Registration.set(request, registration)
    return super.handlePost(request, h)
  }
}

module.exports = CheckYourAnswersHandlers
