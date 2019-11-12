const Photos = require('../../lib/photos/photos')
const config = require('../../config')

/**
 * @size i.e. 'original', 'small' or 'medium'
 * @filename the filename within S3 including the extension
 *
 * Examples:
 * /photos/small/image.jpg
 * /photos/medium/image.jpg
 * /photos/original/image.jpg
 */
class PhotoHandlers extends require('ivory-common-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const filename = encodeURIComponent(request.params.filename)
    const size = encodeURIComponent(request.params.size)

    // Setup the photos call
    const photos = new Photos({
      region: config.s3Region,
      apiVersion: config.s3ApiVersion,
      bucket: config.s3Bucket
    })

    // Get the photo and return with headers
    const photo = await photos.get(filename, size)
    return h.response(photo.Body).type(photo.ContentType)
  }
}

const handlers = new PhotoHandlers()

module.exports = handlers.routes({
  path: '/photos/{size}/{filename}',
  app: {
    tags: ['always']
  }
}).filter(({ method }) => method === 'GET') // Only use the GET method from the parent handler
