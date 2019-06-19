const Joi = require('@hapi/joi')

// Define environment options
const DEVELOPMENT = 'development'
const TEST = 'test'
const PRODUCTION = 'production'

// Define logging levels
const ERROR = 'error'
const INFO = 'info'
const DEBUG = 'debug'

const DEFAULT_PORT = 3000
const DEFAULT_SERVICE_NAME = 'Ivory service name'

// Define the config schema
const schema = {
  port: Joi.number().default(DEFAULT_PORT),
  env: Joi.string().valid(DEVELOPMENT, TEST, PRODUCTION).default(DEVELOPMENT),
  serviceName: Joi.string().default(DEFAULT_SERVICE_NAME),

  // Logging
  logLevel: Joi.string().valid(ERROR, INFO, DEBUG).default(INFO),
  airbrakeEnabled: Joi.bool().default(true),
  airbrakeHost: Joi.when('airbrakeEnabled', { is: true, then: Joi.string().uri().required() }),
  airbrakeKey: Joi.when('airbrakeEnabled', { is: true, then: Joi.string().required() }),
  airbrakeLogLevel: Joi.string().valid(ERROR, INFO, DEBUG).default(INFO),

  // Address lookup
  addressLookUpEnabled: Joi.bool().default(true),
  addressLookUpUri: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().uri().required() }),
  addressLookUpUsername: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpPassword: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpKey: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() })
}

// Build the config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  serviceName: process.env.SERVICE_NAME,

  // Logging
  logLevel: process.env.LOG_LEVEL,
  airbrakeEnabled: process.env.AIRBRAKE_ENABLED,
  airbrakeHost: process.env.AIRBRAKE_HOST,
  airbrakeKey: process.env.AIRBRAKE_PROJECT_KEY,
  airbrakeLogLevel: process.env.AIRBRAKE_LOG_LEVEL,

  // Address lookup
  addressLookUpEnabled: process.env.ADDRESS_LOOKUP_ENABLED,
  addressLookUpUri: process.env.ADDRESS_LOOKUP_URI,
  addressLookUpUsername: process.env.ADDRESS_LOOKUP_USERNAME,
  addressLookUpPassword: process.env.ADDRESS_LOOKUP_PASSWORD,
  addressLookUpKey: process.env.ADDRESS_LOOKUP_KEY
}

// Validate the config
const { value, error } = Joi.validate(config, schema, {
  abortEarly: false
})

// Throw if config is invalid
if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

// Add reference data within config
value.loggingLevels = { DEBUG, INFO, ERROR }

// Add some helper props to the validated config
value.isDev = value.env === DEVELOPMENT
value.isProd = value.env === PRODUCTION
value.isTest = value.env === TEST
value.isDebug = value.airbrakeLogLevel === DEBUG
value.isInfo = value.airbrakeLogLevel === INFO
value.isError = value.airbrakeLogLevel === ERROR

// Export the validated config
module.exports = value
