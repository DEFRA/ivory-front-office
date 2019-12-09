const Joi = require('@hapi/joi')
const path = require('path')
const { utils, joiUtilities } = require('defra-hapi-utils')
const { uuid, setNestedVal, getNestedVal } = utils
const { Item } = require('ivory-data-mapping').cache
const { awsPhotos } = require('defra-hapi-modules').plugins
const { createError } = joiUtilities

class AddPhotographsHandlers extends require('defra-hapi-plugin-handlers') {
  get Item () {
    return Item
  }

  get fieldname () {
    return 'photograph'
  }

  get validFileTypes () {
    return {
      JPG: { mimeType: 'image/jpeg' },
      JPEG: { mimeType: 'image/jpeg' },
      PNG: { mimeType: 'image/png' }
    }
  }

  get schema () {
    const { minKb, maxMb } = this.photos
    const mimeTypes = Object.values(this.validFileTypes).map(({ mimeType }) => mimeType)
    return Joi.object({
      [this.fieldname]: Joi.object({
        _data: Joi.binary().min(minKb * 1024).max(maxMb * 1024 * 1024), // Check the file data buffer size (the important one)
        hapi: Joi.object({
          headers: Joi.object({
            'content-type': Joi.string().valid(...mimeTypes).required() // Check the content-type is set, so we can set it in S3
          }).unknown(true),
          filename: Joi.string().required() // Check a filename is there to get the extension from
        }).unknown(true)
      }).unknown(true)
    })
  }

  get errorMessages () {
    const fileTypes = Object.keys((this.validFileTypes)).join(', ')
    const { minKb, maxMb } = this.photos
    return {
      [this.fieldname]: {
        'string.empty': 'You must add a photo',
        'any.required': 'You must add a photo',
        'any.only': `The selected file must be a ${fileTypes.replace(/,\s([^,]+)$/, ' or $1')}`,
        'binary.min': `The selected file must be bigger than ${minKb}KB`,
        'binary.max': `The selected file must be smaller than ${maxMb}MB`,
        'custom.uploadfailed': 'The selected file could not be uploaded – try again'
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const result = await super.handleGet(request, h, errors)
    if (errors && !getNestedVal(result, 'source.context.DefraCsrfToken')) {
      // Make sure the Csrf Token is included during a photograph upload error
      setNestedVal(result, 'source.context.DefraCsrfToken', request.state.DefraCsrfToken)
    }
    return result
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const photoPayload = request.payload[this.fieldname]
    const fileExtension = path.extname(path.basename(photoPayload.hapi.filename))
    const contentType = photoPayload.hapi.headers['content-type']
    const filename = uuid() + fileExtension

    let filenameUploaded
    try {
      filenameUploaded = await this.photos.upload(filename, contentType, photoPayload)
    } catch (err) {
      // The upload failed, so tell the user to try again
      // Rather than building from scratch, generate an example error structure and overwrite the type
      console.log(`Caught error from upload in handler: ${err}`)
      return this.failAction(request, h, createError(request, [this.fieldname], 'custom.uploadfailed'))
    }

    // Handle cache and delete/overwrite any previously uploaded photo
    // (Despite being an array, for now this only works assuming there's a single photo.. the multiple photos will come later))
    const item = await this.Item.get(request) || { description: '  ' } // Had to include description of spaces so the service doesn't fail saving an empty item

    if (getNestedVal(item, 'photos.length')) {
      // There's already a photo, so delete it from storage and overwrite it in the cache/database (reusing the photo id for now until we handle the array create/delete in the services layer)
      await this.photos.delete(item.photos[0].filename)
      item.photos[0].filename = filenameUploaded
      item.photos[0].confirmed = false
    } else {
      // Else it's the first photo, so create the photos array
      item.photos = []
      const photo = { filename: filenameUploaded, rank: item.photos.length, confirmed: false }
      item.photos.push(photo)
    }
    await this.Item.set(request, item)

    return super.handlePost(request, h)
  }

  async getPayload () {
    this.photos = await awsPhotos.getPhotos()
    return { // https://hapi.dev/api/?v=18.4.0#route.options.payload
      allow: 'multipart/form-data',
      output: 'stream',
      parse: true,
      maxBytes: this.photos.payloadMaxBytes // Hapi defaults to 1048576 (1MB). Allow the max photo size plus some additional payload data.
    }
  }
}

module.exports = AddPhotographsHandlers
