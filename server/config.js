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

// Define the config schema
const schema = Joi.object({
  port: Joi.number().default(DEFAULT_PORT),
  env: Joi.string().valid(DEVELOPMENT, TEST, PRODUCTION).default(DEVELOPMENT),
  serviceName: Joi.string().required(),
  serviceUrl: Joi.string().uri().required(),

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
  redisPort: Joi.when('redisEnabled', { is: true, then: Joi.number().required() }),
  redisHost: Joi.when('redisEnabled', { is: true, then: Joi.string().required() }),

  // Payment
  paymentEnabled: Joi.bool().default(true),
  paymentUrl: Joi.when('paymentEnabled', { is: true, then: Joi.string().uri().required() }),
  paymentKey: Joi.when('paymentEnabled', { is: true, then: Joi.string().required() }),
  paymentAmount: Joi.when('paymentEnabled', { is: true, then: Joi.number().integer().min(1).required() }),

  // Address lookup
  addressLookUpEnabled: Joi.bool().default(true),
  addressLookUpUri: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().uri().required() }),
  addressLookUpUsername: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpPassword: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().required() }),
  addressLookUpKey: Joi.when('addressLookUpEnabled', { is: true, then: Joi.string().min(32).required() }),

  // Service API
  serviceApiEnabled: Joi.bool().default(true),
  serviceApiPort: Joi.when('serviceApiEnabled', { is: true, then: Joi.number().required() }),
  serviceApiHost: Joi.when('serviceApiEnabled', { is: true, then: Joi.string().required() }),

  // Notify
  notifyEnabled: Joi.bool().default(true),
  notifyApiKey: Joi.when('notifyEnabled', { is: true, then: Joi.string().required() }),
  notifyConfirmationTemplateId: Joi.when('notifyEnabled', { is: true, then: Joi.string().required() }),
  notifyEmailReplyToId: Joi.when('notifyEnabled', { is: true, then: Joi.string().email() }),

  // Amazon S3
  s3Enabled: Joi.bool().default(true),
  s3Region: Joi.when('s3Enabled', { is: true, then: Joi.string().required() }),
  s3ApiVersion: Joi.when('s3Enabled', { is: true, then: Joi.string().required() }),
  s3Bucket: Joi.when('s3Enabled', { is: true, then: Joi.string().required() }),

  // Photo upload
  photoUploadPhotoMaxMb: Joi.number().min(1).max(20).default(10),
  photoUploadPhotoMinKb: Joi.number().min(1).max(50).default(50),
  photoUploadPayloadMaxBytes: Joi.number().min(50 * 1024).max(20 * 1024 * 1024).default(10 * 1024 * 1024)
})

// Build the config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  serviceName: process.env.SERVICE_NAME,
  serviceUrl: process.env.SERVICE_URL || `http://localhost:${process.env.PORT || DEFAULT_PORT}`,

  // Caching
  cookieTimeout: process.env.COOKIE_TIMEOUT,
  cookiePassword: process.env.COOKIE_PASSWORD,

  // Redis
  redisEnabled: process.env.REDIS_ENABLED,
  redisPort: process.env.REDIS_PORT,
  redisHost: process.env.REDIS_HOST,

  // Payment
  paymentEnabled: process.env.PAYMENT_ENABLED,
  paymentUrl: process.env.PAYMENT_URL,
  paymentKey: process.env.PAYMENT_KEY,
  paymentAmount: process.env.PAYMENT_AMOUNT,

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
  addressLookUpKey: process.env.ADDRESS_LOOKUP_KEY,

  // Service API
  serviceApiEnabled: process.env.SERVICE_API_ENABLED,
  serviceApiPort: process.env.SERVICE_API_PORT,
  serviceApiHost: process.env.SERVICE_API_HOST,

  // Notify
  notifyEnabled: process.env.NOTIFY_ENABLED,
  notifyApiKey: process.env.NOTIFY_API_KEY,
  notifyConfirmationTemplateId: process.env.NOTIFY_CONFIRMATION_TEMPLATE_ID,
  notifyEmailReplyToId: process.env.NOTIFY_EMAIL_REPLY_TO_ID,

  // Amazon S3
  s3Enabled: process.env.AWS_S3_ENABLED,
  s3Region: process.env.AWS_S3_REGION,
  s3ApiVersion: process.env.AWS_S3_APIVERSION,
  s3Bucket: process.env.AWS_S3_BUCKET,

  // Photo upload
  photoUploadPhotoMaxMb: process.env.PHOTO_UPLOAD_PHOTO_MAX_MB,
  photoUploadPhotoMinKb: process.env.PHOTO_UPLOAD_PHOTO_MIN_KB,
  photoUploadPayloadMaxBytes: process.env.PHOTO_UPLOAD_PAYLOAD_MAX_BYTES
}

// Validate the config
const { value, error } = schema.validate(config, {
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
  // ttl: null, // 'null' will delete the cookie when the browser is closed
  isSecure: value.isProd, // Secure in production
  password: value.cookiePassword,
  isHttpOnly: true,
  clearInvalid: true,
  strictHeader: true
}

// Build serviceApi
value.serviceApi = `${value.serviceApiHost}:${value.serviceApiPort}`

// Export the validated config
module.exports = value
