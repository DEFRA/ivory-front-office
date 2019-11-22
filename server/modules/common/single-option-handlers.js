class SingleOptionHandlers extends require('defra-hapi-modules').option.single.handlers {
  get referenceData () {
    const config = require('../../config')
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
}

module.exports = SingleOptionHandlers
