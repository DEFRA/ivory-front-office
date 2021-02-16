const Joi = require('joi')
let _config

class Utils {
  static get config () {
    if (_config) {
      return _config
    }
    throw new Error('Config not set in common modules')
  }

  static setConfig (config) {
    _config = config
  }

  static createError (request, field, type) {
    // Generate an example error structure
    const schema = Joi.object({ [field]: Joi.string() })
    const errors = schema.validate({ [field]: true })
    const [error] = errors.error.details
    // Replace contents with error we want to create
    error.message = `"${field}" ${request.response.message}`
    error.type = type
    return errors.error
  }
}

module.exports = Utils
