
const joi = require('joi')
const { getNestedVal } = require('./utils')

const joiUtils = {
// Creates a custom joi validation error structure
  createError (request, field, type) {
    // Generate an example error structure
    const schema = joi.object({ [field]: joi.string() })
    const errors = schema.validate({ [field]: true })

    // Replace contents with error we want to create
    const message = `"${field}" ${getNestedVal(request, 'response.message') || 'Unknown error'}`
    errors.error.message = message
    const [error] = errors.error.details
    error.message = message
    error.type = type

    return errors.error
  }
}

module.exports = joiUtils
