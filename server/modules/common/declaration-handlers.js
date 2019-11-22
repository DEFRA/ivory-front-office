class DeclarationHandlers extends require('defra-hapi-modules').declaration.handlers {
  async reference (request) {
    const model = await this.Model.get(request)
    return this.choices.find(({ shortName }) => shortName === model[this.fieldname])
  }

  get referenceData () {
    const config = require('../../config')
    return config.referenceData[this.fieldname] || {}
  }

  get choices () {
    return this.referenceData.choices || []
  }

  get hint () {
    return this.referenceData.hint
  }
}

module.exports = DeclarationHandlers
