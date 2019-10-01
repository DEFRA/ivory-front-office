// TODO Should this code be in ivory-services?
// TODO Loading the config is repeated in both functions so the test stubs work. Probably best this module is refactored as a class.
const fs = require('fs')
const { logger } = require('defra-logging-facade')
const S3 = require('aws-sdk/clients/s3') // The s3 service (rather than the whole 'aws-sdk https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/creating-and-calling-service-objects.html)
const stream = require('stream')

// S3 properties: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property

const photos = {
  async uploadPhoto (filename, contentType, readableStream) {
    // Pull in the S3 config
    const config = require('../../config')
    const { s3Enabled, s3Region, s3ApiVersion, s3Bucket, s3AccessKeyId, s3SecretAccessKey } = config
    const s3Config = {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
      region: s3Region,
      apiVersion: s3ApiVersion
    }
    // Create s3 service object
    const s3 = new S3(s3Config)

    // Upload parameters
    const params = {
      Bucket: s3Bucket,
      Key: filename,
      Body: readableStream,
      ContentType: contentType // Unless explicitly set, its set to 'application/octet-stream' (when payload output: stream)
    }

    let response
    if (s3Enabled) {
      // Upload the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property)
      // Returns an AWS.S3.ManagedUpload object (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html)
      response = await s3.upload(params).promise()
      logger.info(`S3 upload successful with filename: '${response.Key}'`)
      return response.Key
    } else {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to store the photo and using a local test photo instead')
      return 'photos.test.examplePhoto.jpg'
    }
  },

  async createReadStream (s3, params) {
    return s3.getObject(params).createReadStream()
  },

  async getPhotoStream (filename) {
    if (filename === 'undefined') {
      throw new Error(`The filename passed to getPhotoStream is undefined. Filename: '${filename}'`)
    }

    // Pull in the S3 config
    const config = require('../../config')
    const { s3Enabled, s3Region, s3ApiVersion, s3Bucket, s3AccessKeyId, s3SecretAccessKey } = config
    const s3Config = {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
      region: s3Region,
      apiVersion: s3ApiVersion
    }

    // Create s3 service object
    const s3 = new S3(s3Config)

    // Search parameters
    const params = {
      Bucket: s3Bucket,
      Key: filename
    }

    let photoStream
    if (s3Enabled) {
      // Get the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property)
      // Returns an AWS.Request object (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html)
      // Then invoke createReadStream() to get a stream of the raw HTTP body contents (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#createReadStream-property)
      photoStream = await photos.createReadStream(s3, params)

      // Basic checks on the response
      if (!(photoStream instanceof stream.Readable)) {
        throw new Error('S3 did not return a stream')
      }
    } else {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to retrieve stored photo and using local test photo instead')
      photoStream = await fs.createReadStream(`${__dirname}/photos.test.examplePhoto.jpg`)
    }
    return photoStream
  }
}

module.exports = photos
