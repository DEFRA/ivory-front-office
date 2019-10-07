const Joi = require('@hapi/joi')
const config = require('../../../config')
const { utils } = require('ivory-shared')

class DeclarationHandlers extends require('../handlers') {
  get schema () {
    return Joi.object({
      declaration: Joi.string().valid(this.declaration).required(),
      description: Joi.string().trim().max(this.maxFreeTextLength).required()
    })
  }

  async errorMessages (request) {
    const reference = await this.reference(request)
    const details = reference[this.declaration]
    return {
      declaration: {
        'any.allowOnly': `You must declare ${details}`,
        'any.required': `You must declare ${details}`
      },
      description: {
        'any.empty': `You must explain how you know ${details}`,
        'any.required': `You must explain how you know ${details}`,
        'string.max': `You must explain how you know ${details} in less than ${this.maxFreeTextLength} characters`
      }
    }
  }

  async reference (request) {
    const model = await this.Model.get(request)
    return config.referenceData[this.fieldname].choices.find(({ shortName }) => shortName === model[this.fieldname])
  }

  getDeclarationLabel (reference) {
    return `I declare ${reference[this.declaration]}`
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const reference = await this.reference(request)
    const { Model } = this
    const model = await Model.get(request) || {}
    this.viewData = {
      declaration: this.declaration,
      declarationLabel: await this.getDeclarationLabel(reference),
      declarationChecked: model[this.declaration] || !!utils.getNestedVal(request, 'payload.declaration'),
      description: model[this.description],
      descriptionLabel: `Explain how you know ${reference[this.declaration]}`
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const { Model } = this
    const model = await Model.get(request) || {}
    model[this.declaration] = true
    model[this.description] = request.payload.description
    await Model.set(request, model)
    return super.handlePost(request, h)
  }
}

module.exports = DeclarationHandlers
