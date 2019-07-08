const Joi = require('@hapi/joi')

// Define environment options
const DEVELOPMENT = 'development'
const TEST = 'test'
const PRODUCTION = 'production'

// Define logging levels
const ERROR = 'error'
const INFO = 'info'
const DEBUG = 'debug'
const dotenv = require('dotenv')
dotenv.config() // Load variables from .env before any other code (especially before requiring the config.js)

const DEFAULT_PORT = 3000
const DEFAULT_REDIS_PORT = 6379

// Define the config schema
const schema = {
  port: Joi.number().default(DEFAULT_PORT),
  env: Joi.string().valid(DEVELOPMENT, TEST, PRODUCTION).default(DEVELOPMENT),
  serviceName: Joi.string().required(),

  // Logging
  logLevel: Joi.string().valid(ERROR, INFO, DEBUG).default(INFO),
  airbrakeEnabled: Joi.bool().default(true),
  airbrakeHost: Joi.when('airbrakeEnabled', { is: true, then: Joi.string().uri().required() }),
  airbrakeKey: Joi.when('airbrakeEnabled', { is: true, then: Joi.string().min(32).required() }),
  airbrakeLogLevel: Joi.string().valid(ERROR, INFO, DEBUG).default(INFO),

  // Caching
  cookieTimeout: Joi.number().min(60000).default(10800000),
  cookiePassword: Joi.string().min(32).required(),

  // Redis
  redisEnabled: Joi.bool().default(true),
  redisPort: Joi.number().default(DEFAULT_REDIS_PORT),
  redisHost: Joi.when('redisEnabled', { is: true, then: Joi.string().required() }),

  // Address lookup
  addressLookUpEnabled: Joi.bool().default(true),
  addressLookUpUri: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().uri().required() }),
  addressLookUpUsername: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpPassword: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpKey: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().min(32).required() })
}

// Build the config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  serviceName: process.env.SERVICE_NAME,

  // Caching
  cookieTimeout: process.env.COOKIE_TIMEOUT,
  cookiePassword: process.env.COOKIE_PASSWORD,

  // Redis
  redisEnabled: process.env.REDIS_ENABLED,
  redisPort: process.env.REDIS_PORT,
  redisHost: process.env.REDIS_HOST,

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

// Build cookie options
value.cookieOptions = {
  ttl: null, // 'null' will delete the cookie when the browser is closed
  isSecure: value.isProd, // Secure in production
  password: value.cookiePassword,
  isHttpOnly: true,
  clearInvalid: true,
  strictHeader: true
}

// Export the validated config
module.exports = value
