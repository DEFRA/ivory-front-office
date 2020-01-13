const Joi = require('@hapi/joi')
const path = require('path')
const { utils, joiUtilities } = require('defra-hapi-utils')
const { uuid, setNestedVal, getNestedVal } = utils
const { Item } = require('ivory-data-mapping').cache
const photos = require('defra-hapi-photos')
const { logger } = require('defra-logging-facade')
const { createError } = joiUtilities

class AddPhotographsHandlers extends require('defra-hapi-handlers') {
  get Item () {
    return Item
  }

  get fieldname () {
    return 'photograph'
  }

  get maxPhotos () {
    return 6
  }

  get validFileTypes () {
    return {
      JPG: { mimeType: 'image/jpeg' },
      JPEG: { mimeType: 'image/jpeg' },
      PNG: { mimeType: 'image/png' }
    }
  }

  get mimeTypes () {
    return Object.values(this.validFileTypes).map(({ mimeType }) => mimeType)
  }

  get photoSchema () {
    const { minKb, maxMb } = this.photos
    return Joi.object({
      _data: Joi.binary().min(minKb * 1024).max(maxMb * 1024 * 1024), // Check the file data buffer size (the important one)
      hapi: Joi.object({
        headers: Joi.object({
          'content-type': Joi.string().valid(...this.mimeTypes).required() // Check the content-type is set, so we can set it in S3
        }).unknown(true),
        filename: Joi.string().required() // Check a filename is there to get the extension from
      }).unknown(true)
    }).unknown(true)
  }

  get schema () {
    return Joi.alternatives().try(
      Joi.object({ [this.fieldname]: this.photoSchema }),
      Joi.object({ [this.fieldname]: Joi.array().items(this.photoSchema).max(this.maxPhotos) })
    )
  }

  get errorMessages () {
    const fileTypes = Object.keys((this.validFileTypes)).join(', ')
    const { minKb, maxMb } = this.photos
    return {
      [this.fieldname]: {
        'string.empty': 'You must add a photo',
        'array.max': `Only a maximum of ${this.maxPhotos} files can be uploaded – try again`,
        'any.only': `The selected file must be a ${fileTypes.replace(/,\s([^,]+)$/, ' or $1')}`,
        'binary.min': `The selected file must be bigger than ${minKb}KB`,
        'binary.max': `The selected file must be smaller than ${maxMb}MB`,
        'custom.uploadfailed': 'The selected file could not be uploaded – try again'
        // 'array.base': 'You must add a photo'
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    this.viewData = {
      mimeTypes: this.mimeTypes.join(', ')
    }
    const result = await super.handleGet(request, h, errors)
    if (errors && !getNestedVal(result, 'source.context.DefraCsrfToken')) {
      // Make sure the Csrf Token is included during a photograph upload error
      setNestedVal(result, 'source.context.DefraCsrfToken', request.state.DefraCsrfToken)
    }
    return result
  }

  async handleUpload (request, h, item, photoPayload) {
    const originalFilename = path.basename(photoPayload.hapi.filename)
    const fileExtension = path.extname(originalFilename)
    const contentType = photoPayload.hapi.headers['content-type']
    const filename = uuid() + fileExtension

    let filenameUploaded
    try {
      filenameUploaded = await this.photos.upload(filename, contentType, photoPayload)
    } catch (err) {
      // The upload failed, so tell the user to try again
      // Rather than building from scratch, generate an example error structure and overwrite the type
      logger.error(`Caught error from upload in handler: ${err}`)
      return err
    }

    const photo = { filename: filenameUploaded, originalFilename, rank: item.photos.length, confirmed: false }
    item.photos.push(photo)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const item = await this.Item.get(request) || { description: '  ' } // Had to include description of spaces so the service doesn't fail saving an empty item
    if (!getNestedVal(item, 'photos.length')) {
    // It's the first photo, so create the photos array
      item.photos = []
    }

    const payload = request.payload[this.fieldname]

    const data = Array.isArray(payload) ? payload : [payload]

    const errors = await Promise.all(data.map(async (photoPayload) => this.handleUpload(request, h, item, photoPayload)))
    const error = errors.find((error) => error)

    if (error) {
      return this.failAction(request, h, createError(request, [this.fieldname], 'custom.uploadfailed'))
    }

    await this.Item.set(request, item)

    return super.handlePost(request, h)
  }

  async getPayload () {
    this.photos = await photos.getPhotos()
    return { // https://hapi.dev/api/?v=18.4.0#route.options.payload
      allow: 'multipart/form-data',
      output: 'stream',
      parse: true,
      maxBytes: this.photos.payloadMaxBytes // Hapi defaults to 1048576 (1MB). Allow the max photo size plus some additional payload data.
    }
  }
}

module.exports = AddPhotographsHandlers
