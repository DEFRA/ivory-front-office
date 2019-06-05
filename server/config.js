const joi = require('joi')

// Define config schema
const schema = {
  port: joi.number().default(3000),
  env: joi.string().valid('development', 'test', 'production').default('development')
}

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV
}

// Validate config
const result = joi.validate(config, schema, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const values = result.value

// Add some helper props
values.isDev = values.env === 'development'
values.isProd = values.env === 'production'

// Add some non-Joi validated config values
// TODO: Do we want to validate all config values?  Seems a bit keen.
values.serviceName = 'Ivory service name'

module.exports = values
