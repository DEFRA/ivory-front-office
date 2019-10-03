const { logger } = require('defra-logging-facade')
const joi = require('@hapi/joi')
const S3 = require('aws-sdk/clients/s3') // The s3 service (rather than the whole 'aws-sdk' https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/creating-and-calling-service-objects.html)
const config = require('../../config')
const stream = require('stream')
const fs = require('fs')

module.exports = class Photos {
  constructor (config) {
    const schema = {
      region: joi.string().default('REGION'),
      apiVersion: joi.string().default('API_VERSION'),
      bucket: joi.string().default('BUCKET')
    }

    // Validate the config
    const { value, error } = joi.validate(config, schema, {
      abortEarly: false
    })
    if (error) {
      throw new Error(`The photos config is invalid. ${error.message}`)
    }
    // Assign the config to the instance
    Object.assign(this, value)

    // Additionally create s3 service object and assign it to the instance
    // S3 properties: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
    this.s3 = new S3({
      region: value.region,
      apiVersion: value.apiVersion
    })
  }

  async uploadPhoto (filename, contentType, readableStream) {
    // Set the upload parameters
    const params = {
      Bucket: this.bucket,
      Key: filename,
      Body: readableStream,
      ContentType: contentType // Unless explicitly set, its set to 'application/octet-stream' when payload output: stream)
    }

    let response
    if (config.s3Enabled) {
      // Upload the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property)
      // Returns an AWS.S3.ManagedUpload object (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html)
      response = await this.s3.upload(params).promise()
      logger.info(`S3 upload successful with filename: '${response.Key}'`)
      return response.Key
    } else {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to store the photo and using a local test photo instead')
      return 'photos.test.examplePhoto.jpg'
    }
  }

  async getPhotoStream (filename) {
    if (filename === 'undefined') {
      throw new Error('The filename passed to getPhotoStream is undefined.')
    }

    // Set the search parameters
    const params = {
      Bucket: this.bucket,
      Key: filename
    }

    let photoStream
    if (config.s3Enabled) {
      // Get the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property)
      // Returns an AWS.Request object (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html)
      // Then invoke createReadStream() to get a stream of the raw HTTP body contents (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#createReadStream-property)
      photoStream = await this.createReadStream(params)

      // Basic checks on the response
      if (!(photoStream instanceof stream.Readable)) {
        throw new Error('S3 did not return a readable stream')
      }
    } else {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to retrieve stored photo and using local test photo instead')
      photoStream = await fs.createReadStream(`${__dirname}/photos.test.examplePhoto.jpg`)
    }
    return photoStream
  }

  // This is in a separate function so we can stub this function out.  The getObject function appears a dynamically generated function so difficult to stub.
  async createReadStream (params) {
    return this.s3.getObject(params).createReadStream()
  }
}
