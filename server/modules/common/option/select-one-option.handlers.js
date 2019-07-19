const Joi = require('@hapi/joi')
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
      .map(({ label: text, shortName: value, hint }) => {
        return { text, value, hint }
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
    return this.getCache(request, 'registration') || {}
  }

  async setData (request, registration) {
    return this.setCache(request, 'registration', registration)
  }

  errorLink (field) {
    return `#${referenceData[field] ? `${field}-1` : field}` // If this is a reference data field, then link to first option
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const data = await this.getData(request)
    const { hint } = this.referenceData

    // Use the payload in this special case to force the items to be displayed even when there is an error
    request.payload = {
      legend: await this.getPageHeading(request),
      hint: hint ? { text: hint } : undefined,
      items: this.items.map(({ value, text, hint }) => {
        return {
          value: value.toString(),
          text,
          hint: hint ? { text: hint } : undefined,
          checked: value === data[this.fieldName]
        }
      })
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const data = await this.getData(request)
    data[this.fieldName] = request.payload[this.fieldName]
    await this.setData(request, data)
    return super.postHandler(request, h)
  }
}

module.exports = SelectOneOptionHandlers
