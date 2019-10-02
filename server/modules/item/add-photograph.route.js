const Joi = require('@hapi/joi')
const { Item } = require('../../lib/cache')
const { photoUploadPhotoMaxMb, photoUploadPayloadMaxBytes } = require('../../config')
const photos = require('../../lib/photos/photos')
const path = require('path')
const { uuid } = require('ivory-shared').utils

class AddPhotographsHandlers extends require('../common/handlers') {
  get schema () {
    return Joi.object({
      photograph: Joi.object({
        hapi: Joi.object({
          filename: Joi.string().required(), // Check a filename is there to get the extension from
          headers: Joi.object({
            'content-type': Joi.string().required() // Check the content-type is set, so we can set it in S3
          }).unknown(true)
        }).unknown(true),
        _data: Joi.binary().min(1).max(photoUploadPhotoMaxMb * 1024 * 1024) // Check the file data buffer size (the important one)
      }).unknown(true)
    })
  }

  get errorMessages () {
    return {
      photograph: {
        'any.empty': 'Select a photograph',
        'any.required': 'Select a photograph',
        'binary.min': 'Select a photograph',
        'binary.max': `The selected file must be smaller than ${photoUploadPhotoMaxMb}MB`
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
    maxBytes: photoUploadPayloadMaxBytes // Hapi defaults to 1048576 (1MB). Allow the max photo size plus some additional payload data.
  }
})
