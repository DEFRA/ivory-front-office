const registrationNumberGenerator = require('../../lib/registration-number-generator')
const config = require('../../config')
const {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item
} = require('../../lib/cache')

class CheckYourAnswersHandlers extends require('../common/handlers') {
  static getReference (group, shortName) {
    return config.referenceData[group].choices.find((choice) => choice.shortName === shortName)
  }

  async isOwner (request) {
    const { ownerType } = await Registration.get(request) || {}
    return ownerType === 'agent'
  }

  getPerson (person, address, prefix = 'Your') {
    if (typeof prefix !== 'object') {
      prefix = { default: prefix }
    }
    const answers = []
    if (person.fullName) {
      answers.push({
        key: `${prefix.name || prefix.default} name`,
        value: person.fullName
      })
    }

    if (address.addressLine) {
      answers.push({
        key: `${prefix.address || prefix.default} address`,
        html: address.addressLine.split(',').join('<br>')
      })
    }

    if (person.email) {
      answers.push({
        key: `${prefix.email || prefix.default} email`,
        value: person.email
      })
    }

    return answers
  }

  getExemption (heading, declaration, description, reference) {
    const answers = []

    if (declaration) {
      answers.push({
        key: heading,
        html: `
            I declare ${reference}
            <br><br>
            Other supporting evidence:
            <br><br>
            ${description.replace(/[\r]/g, '<br>')}
        `
      })
    }

    return answers
  }

  buildRows (answers) {
    return answers.map(({ key, value, html }) => {
      const classes = `ivory-${key.toLowerCase().split(' ').join('-')}`
      const row = {
        key: { text: key }
      }

      if (value) {
        row.value = { classes, text: value }
      } else if (html) {
        row.value = { classes, html }
      }

      // ToDo: Add the actions when changing data functionality is implemented
      // actions: {
      //   items: [
      //     {
      //       href: '#',
      //       text: 'Change',
      //       visuallyHiddenText: key.toLowerCase()
      //     }
      //   ]
      // }

      return row
    })
  }

  async handleGet (request, h, errors) {
    const registration = await Registration.get(request) || {}
    const owner = await Owner.get(request) || {}
    const ownerAddress = await OwnerAddress.get(request) || {}
    const agent = await Agent.get(request) || {}
    const agentAddress = await AgentAddress.get(request) || {}
    const item = await Item.get(request) || {}
    const { dealingIntent } = registration
    const { itemType } = item

    let answers = []

    const itemTypeReference = CheckYourAnswersHandlers.getReference('itemType', itemType)

    if (itemTypeReference) {
      answers.push({
        key: 'Item type',
        value: itemTypeReference.label
      })
    }

    // TODO: Handle multiple photos
    if (item.photos) {
      // item.photos.forEach((photo) => {
      const lastphoto = item.photos[item.photos.length - 1] // Until we handle multiple photos, take the last photo
      answers.push({
        key: 'Photograph',
        // html: `<img src="/photos/${photo.filename}" height="200" border="0">`
        html: `<img src="/photos/${lastphoto.filename}" height="200" border="0">`
      })
      // })
    }

    if (item.description) {
      answers.push({
        key: 'Description',
        html: item.description.replace(/[\r]/g, '<br>')
      })
    }

    if (item.ageExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Age of Ivory',
        item.ageExemptionDeclaration,
        item.ageExemptionDescription,
        itemTypeReference.ageExemptionDeclaration))
    }

    if (item.volumeExemptionDeclaration) {
      answers = answers.concat(this.getExemption('Volume of Ivory',
        item.volumeExemptionDeclaration,
        item.volumeExemptionDescription,
        itemTypeReference.volumeExemptionDeclaration))
    }

    if (agent.fullName) {
      answers = answers.concat(this.getPerson(agent, agentAddress, { name: 'Contact', default: 'Your' }))
    }

    if (owner.fullName) {
      answers = answers.concat(this.getPerson(owner, ownerAddress, await this.isOwner(request) ? 'Your' : 'Owner\'s'))
    }

    if (dealingIntent) {
      const intent = CheckYourAnswersHandlers.getReference('dealingIntent', dealingIntent)
      answers.push({
        key: 'Intention',
        value: intent.display
      })
    }

    this.viewData = { rows: this.buildRows(answers) }

    return super.handleGet(request, h, errors)
  }

  async handlePost (request, h) {
    const registration = await Registration.get(request) || {}
    if (!registration.registrationNumber) {
      registration.registrationNumber = await registrationNumberGenerator.get()
    }
    await Registration.set(request, registration)
    return super.handlePost(request, h)
  }
}

const handlers = new CheckYourAnswersHandlers()

module.exports = handlers.routes({
  path: '/check-your-answers',
  app: {
    pageHeading: 'Check your answers',
    view: 'check-your-answers/check-your-answers',
    nextPath: '/payment'
  }
})
