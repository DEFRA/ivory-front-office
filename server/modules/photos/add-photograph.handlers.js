const Joi = require('@hapi/joi')
const { Item } = require('ivory-data-mapping').cache
const config = require('../../config')
const Photos = require('../../lib/photos/photos')
const path = require('path')
const { utils, joiUtilities } = require('ivory-shared')
const { uuid, setNestedVal, getNestedVal } = utils
const { createError } = joiUtilities

class AddPhotographsHandlers extends require('ivory-common-modules').handlers {
  get validFileTypes () {
    return {
      JPG: { mimeType: 'image/jpeg' },
      JPEG: { mimeType: 'image/jpeg' },
      PNG: { mimeType: 'image/png' }
    }
  }

  get schema () {
    const mimeTypes = Object.values(this.validFileTypes).map(({ mimeType }) => mimeType)
    return Joi.object({
      photograph: Joi.object({
        _data: Joi.binary().min(config.photoUploadPhotoMinKb * 1024).max(config.photoUploadPhotoMaxMb * 1024 * 1024), // Check the file data buffer size (the important one)
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
    return {
      photograph: {
        'string.empty': 'You must add a photo',
        'any.required': 'You must add a photo',
        'any.only': `The selected file must be a ${fileTypes.replace(/,\s([^,]+)$/, ' or $1')}`,
        'binary.min': `The selected file must be bigger than ${config.photoUploadPhotoMinKb}KB`,
        'binary.max': `The selected file must be smaller than ${config.photoUploadPhotoMaxMb}MB`,
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
    const photoPayload = request.payload.photograph
    const fileExtension = path.extname(path.basename(photoPayload.hapi.filename))
    const contentType = photoPayload.hapi.headers['content-type']
    const filename = uuid() + fileExtension

    // Prepare upload config
    const photos = new Photos({
      region: config.s3Region,
      apiVersion: config.s3ApiVersion,
      bucket: config.s3Bucket
    })

    let filenameUploaded
    try {
      filenameUploaded = await photos.upload(filename, contentType, photoPayload)
    } catch (err) {
      // The upload failed, so tell the user to try again
      // Rather than building from scratch, generate an example error structure and overwrite the type
      console.log(`Caught error from upload in handler: ${err}`)
      return this.failAction(request, h, createError(request, 'photograph', 'custom.uploadfailed'))
    }

    // Handle cache and delete/overwrite any previously uploaded photo
    // (Despite being an array, for now this only works assuming there's a single photo.. the multiple photos will come later))
    const item = await Item.get(request) || { description: '  ' } // Had to include description of spaces so the service doesn't fail saving an empty item

    if (getNestedVal(item, 'photos.length')) {
      // There's already a photo, so delete it from storage and overwrite it in the cache/database (reusing the photo id for now until we handle the array create/delete in the services layer)
      await photos.delete(item.photos[0].filename)
      item.photos[0].filename = filenameUploaded
    } else {
      // Else it's the first photo, so create the photos array
      item.photos = []
      const photo = { filename: filenameUploaded, rank: item.photos.length }
      item.photos.push(photo)
    }
    await Item.set(request, item)

    return super.handlePost(request, h)
  }

  get payload () {
    return { // https://hapi.dev/api/?v=18.4.0#route.options.payload
      allow: 'multipart/form-data',
      output: 'stream',
      parse: true,
      maxBytes: config.photoUploadPayloadMaxBytes // Hapi defaults to 1048576 (1MB). Allow the max photo size plus some additional payload data.
    }
  }
}

module.exports = AddPhotographsHandlers
