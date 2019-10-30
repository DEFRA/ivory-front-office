const { logger } = require('defra-logging-facade')
const joi = require('@hapi/joi')
const S3 = require('aws-sdk/clients/s3')
const config = require('../../config')
const stream = require('stream')
const fs = require('fs')
const sharp = require('sharp')

module.exports = class Photos {
  constructor (config) {
    const schema = joi.object({
      region: joi.string().default('REGION'),
      apiVersion: joi.string().default('API_VERSION'),
      bucket: joi.string().default('BUCKET')
    })

    // Validate the config
    const { value, error } = schema.validate(config, {
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

  // Alongside the original, these are the other sizes we store
  get alternativeSizes () {
    return {
      small: {
        width: config.photoSmallMaxWidth,
        height: config.photoSmallMaxHeight,
        filenamePrefix: config.photoSmallPrefix
      },
      medium: {
        width: config.photoMediumMaxWidth,
        height: config.photoMediumMaxHeight,
        filenamePrefix: config.photoMediumPrefix
      }
    }
  }

  async upload (filename, contentType, readStream) {
    if (!config.s3Enabled) {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to store the photo and using a local test photo instead')
      return 'photos.test.examplePhoto.jpg'
    }
    /*
    ...Streams...
    To ensure a single readStream can pipe safely to multiple write streams, I found it must pass through 'transform' streams on it's way to the end write stream.
    Without this it may work, but if there are any timing issues, the slower write stream will only pick up the tail end (or none) of the read stream's data.
    Ensure it is piped to all transform streams before being piped through to a single end write stream (which is when it triggers the stream to start).
    The read stream will wait for slowest transform stream.
    Therefore for the original image use a 'PassThrough' transform stream.  The resized images need to pass through 'sharp' which is already a transform stream.  However, to be explicit and clear the code pipes them all to PassThrough streams.
    Using streams like this ensures the whole image isn't loaded into memory.  But be careful changing this logic.
    (That said the s3.upload appears to remove the memory efficiency of streams and load the image into memory, hmm!)
    */
    const passThroughStreamOriginal = readStream.pipe(new stream.PassThrough())
    const passThroughStreamSmall = readStream.pipe(new stream.PassThrough())
    const passThroughStreamMedium = readStream.pipe(new stream.PassThrough())

    // Kick off all uploads and wait for them all to complete (this isn't in a .map because we need to explicitly pipe to a PassThrough first and the code was looking complex)
    await Promise.all([
      this._uploadToS3(filename, contentType, passThroughStreamOriginal),
      this._resizeAndUploadToS3(this.alternativeSizes.small, filename, contentType, passThroughStreamSmall),
      this._resizeAndUploadToS3(this.alternativeSizes.medium, filename, contentType, passThroughStreamMedium)
    ])
      .then(values => {
        logger.debug(`resultArray: ${values}`)
        logger.info('The photo (and its alternative sizes) were uploaded to S3.')
      })
      .catch(error => {
        // The Promise.all resolves once a single promise rejects, so we don't know which uploads were successful.
        // therefore attempt to delete all photo variants
        logger.info('One or all of the photo sizes failed to upload.')
        this.delete(filename)
        throw (error)
      })
    return filename
  }

  async _uploadToS3 (filename, contentType, readStream) {
    // Set the upload parameters
    const params = {
      Bucket: this.bucket,
      Key: filename,
      Body: readStream,
      ContentType: contentType // Needs to be explicitly set (otherwise its set to 'application/octet-stream')
    }
    // Upload the photo
    const response = await this.s3.upload(params).promise()
      .catch(error => {
        logger.error(`Error while uploading to S3: ${error}`)
        throw (error)
      })
    logger.info(`Photo uploaded with ${response.Key}`)
    return response.Key
  }

  async _resizeAndUploadToS3 (sizeConfig, filename, contentType, readStream) {
    // Create the resizing transform stream
    const resizeTransformStream = sharp()
      .resize({
        width: sizeConfig.width,
        height: sizeConfig.height,
        fit: sharp.fit.inside, // Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified
        withoutEnlargement: true // Do not enlarge if the width or height are already less than the specified dimensions
      })
    // Pipe the read stream to the resizing transform stream
    readStream.pipe(resizeTransformStream)
    // Upload to S3
    const alternativeSizeFilename = `${sizeConfig.filenamePrefix}${filename}`
    const key = this._uploadToS3(alternativeSizeFilename, contentType, resizeTransformStream)
    return key
  }

  async delete (filename) {
    if (!config.s3Enabled) {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to delete the photo')
      return // Nothing is returned from S3.delete (the current way S3 is setup)
    }
    // Delete all image sizes for that photo (the original and the alternative sizes)
    await Promise.all([
      this._deleteFromS3(filename),
      ...Object.values(this.alternativeSizes).map((sizeConfig) => this._deleteFromS3(`${sizeConfig.filenamePrefix}${filename}`))
    ])
      .then(() => {
        logger.info(`Photo (and it's alternative sizes) deleted from S3: ${filename}`)
      })
      .catch(error => {
        logger.info('One or all of the photo alternative sizes failed to delete.')
        throw (error)
      })
  }

  async _deleteFromS3 (filename) {
    // Set the delete parameters
    const params = {
      Bucket: this.bucket,
      Key: filename
    }

    // Delete the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property)
    // S3 does not confirm the delete.  Also if the file isn't there it quietly accepts it, so implied a delete occurred.
    await this.s3.deleteObject(params).promise()
      .catch(error => {
        logger.error(`Error deleting from S3: ${error}`)
        throw (error)
      })
    logger.debug(`Photo deleted from S3: ${filename}`)
  }

  async get (filename, size) {
    if (!config.s3Enabled) {
      logger.debug('AWS_S3_ENABLED is false, therefore pretending to retrieve stored photo and using local test photo instead')
      const photo = {}
      photo.Body = await fs.createReadStream(`${__dirname}/photos.test.examplePhoto.jpg`)
      photo.ContentType = 'image/jpeg'
      return photo
    }
    // Check the filename
    if (filename === 'undefined') {
      throw new Error('The filename passed to getStream is undefined.')
    }
    // Check the size is valid
    const alternativeSizesArray = Object.keys(this.alternativeSizes)
    if (size === undefined || (size !== 'original' && !alternativeSizesArray.includes(size))) {
    // if (size === undefined || (size !== 'original' && !Object.keys(this.alternativeSizes).includes(size))) {
      throw new Error('An invalid photo size requested.')
    }

    // Set the key
    let key
    if (size === 'original') {
      key = filename
    } else {
      key = `${this.alternativeSizes[size].filenamePrefix}${filename}`
    }

    // Set the S3 parameters
    const params = {
      Bucket: this.bucket,
      Key: key
    }

    // Get the photo (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property)
    // We had a choice here...
    // 1. Stream the photo to the page without the content-type (defaults to application/octet) using getObject.createReadStream()
    // 2. Load the photo into memory and get the content-type to pass to the page
    // I've chosen 2 as we're dealing with small resized photos most/possibly-all of the time, and we should tell the browser the content type
    const result = await this.s3.getObject(params).promise()
      .catch(error => {
        logger.error(`S3 failed to get the photo with error: ${error}`)
        throw (error)
      })

    return result
  }
}
