const Joi = require('@hapi/joi')

class SingleOptionHandlers extends require('defra-hapi-handlers') {
  get schema () {
    const validValues = this.items.map(({ value }) => value)
    return Joi.object({
      [this.fieldname]: Joi.string().valid(...validValues).required()
    })
  }

  get errorMessages () {
    return {
      [this.fieldname]: {
        'any.required': this.selectError
      }
    }
  }

  async getData (request) {
    return await this.Model.get(request) || {}
  }

  async setData (request, registration) {
    return this.Model.set(request, registration)
  }

  get referenceData () {
    const config = require('../../../../config')
    return config.referenceData[this.fieldname] || {}
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

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const data = await this.getData(request)
    const { fieldname, hint, divider } = this

    const items = this.items.map(({ value, text, hint, storedValue = value }) => {
      return {
        value: value.toString(),
        text,
        hint: hint ? { text: hint } : undefined,
        checked: storedValue !== undefined && storedValue === data[fieldname]
      }
    })

    if (divider) {
      // Insert the divider before the last item
      items.splice(items.length - 1, 0, { divider })
    }

    this.viewData = {
      hint: hint ? { text: hint } : undefined,
      items,
      description: this.description,
      guidanceLink: this.guidanceLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const data = await this.getData(request)
    const { value, storedValue = value } = this.items.find(({ value }) => {
      return request.payload[this.fieldname] === value
    })
    if (this.onChange && data[this.fieldname] !== storedValue) {
      await this.onChange(data)
    }
    data[this.fieldname] = storedValue
    await this.setData(request, data)
    return super.handlePost(request, h)
  }
}

module.exports = SingleOptionHandlers
