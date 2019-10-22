const Joi = require('@hapi/joi')
const { Item } = require('../../lib/cache')
const config = require('../../config')
const Photos = require('../../lib/photos/photos')
const path = require('path')
const { uuid } = require('ivory-shared').utils

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
        'any.empty': 'You must add a photo',
        'any.required': 'You must add a photo',
        'any.allowOnly': `The selected file must be a ${fileTypes.replace(/,\s([^,]+)$/, ' or $1')}`,
        'binary.min': `The selected file must be bigger than ${config.photoUploadPhotoMinKb}KB`,
        'binary.max': `The selected file must be smaller than ${config.photoUploadPhotoMaxMb}MB`
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const photoPayload = request.payload.photograph
    const fileExtension = path.extname(path.basename(photoPayload.hapi.filename))
    const contentType = photoPayload.hapi.headers['content-type']
    const photoFilename = uuid() + fileExtension

    // Upload photo
    const photos = new Photos({
      region: config.s3Region,
      apiVersion: config.s3ApiVersion,
      bucket: config.s3Bucket
    })
    const filename = await photos.uploadPhoto(photoFilename, contentType, photoPayload)

    // Handle cache
    const item = await Item.get(request) || { description: '  ' } // Had to include description of spaces so the service doesn't fail saving an empty item
    if (!item.photos) {
      item.photos = []
    }
    const photo = { filename, rank: item.photos.length }
    item.photos.push(photo)
    await Item.set(request, item)

    return super.handlePost(request, h)
  }
}

const handlers = new AddPhotographsHandlers()

module.exports = handlers.routes({
  path: '/add-photograph',
  app: {
    pageHeading: 'Add a photo',
    view: 'item/add-photograph',
    nextPath: '/check-photograph',
    isQuestionPage: true
  },
  payload: { // https://hapi.dev/api/?v=18.4.0#route.options.payload
    allow: 'multipart/form-data',
    output: 'stream',
    parse: true,
    maxBytes: config.photoUploadPayloadMaxBytes // Hapi defaults to 1048576 (1MB). Allow the max photo size plus some additional payload data.
  }
})
