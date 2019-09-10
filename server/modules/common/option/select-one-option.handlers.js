const Joi = require('@hapi/joi')
const { Registration } = require('../../../lib/cache')
const { referenceData } = require('../../../config')

class SelectOneOptionHandlers extends require('../handlers') {
  get referenceData () {
    return referenceData[this.fieldName] || {}
  }

  get choices () {
    return this.referenceData.choices || []
  }

  get items () {
    return this.choices
      .map(({ label: text, shortName: value, hint, value: storedValue }) => {
        return { text, value, hint, storedValue }
      })
  }

  get schema () {
    const validValues = this.items.map(({ value }) => value)
    return {
      [this.fieldName]: Joi.string().valid(...validValues).required()
    }
  }

  get errorMessages () {
    return {
      [this.fieldName]: {
        'any.required': this.selectError
      }
    }
  }

  async getData (request) {
    return await Registration.get(request) || {}
  }

  async setData (request, registration) {
    return Registration.set(request, registration, true)
  }

  errorLink (field) {
    return `#${this.referenceData ? `${field}-1` : field}` // If this is a reference data field, then link to first option
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const data = await this.getData(request)
    const { hint } = this.referenceData

    // Use the payload in this special case to force the items to be displayed even when there is an error
    this.viewData = {
      hint: hint ? { text: hint } : undefined,
      items: this.items.map(({ value, text, hint, storedValue }) => {
        return {
          value: value.toString(),
          text,
          hint: hint ? { text: hint } : undefined,
          checked: storedValue === data[this.fieldName]
        }
      })
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const data = await this.getData(request)
    const choice = this.choices.find(({ shortName }) => request.payload[this.fieldName] === shortName)
    data[this.fieldName] = choice.value
    await this.setData(request, data)
    return super.handlePost(request, h)
  }
}

module.exports = SelectOneOptionHandlers
