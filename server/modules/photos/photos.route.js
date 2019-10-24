const Photos = require('../../lib/photos/photos')
const config = require('../../config')

/**
 * @size 'original' or 'maxwidthxmaxheight'
 * @key the filename within S3 including the extension
 *
 * Examples:
 * /photos/original/image.jpg
 * /photos/200x300/image.jpg
 */
class PhotoHandlers extends require('ivory-common-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const key = encodeURIComponent(request.params.key)
    const size = encodeURIComponent(request.params.size)

    // Check the parameters
    let original, maxwidth, maxheight
    if (size === 'original') {
      original = true
    } else {
      original = false
      maxwidth = Number(size.split('x')[0])
      maxheight = Number(size.split('x')[1])
      if (isNaN(maxwidth) || isNaN(maxheight)) {
        throw new Error(`Incorrect parameters passed to route: ${request.path}`)
      }
    }

    // Create the photos object
    const photos = new Photos({
      region: config.s3Region,
      apiVersion: config.s3ApiVersion,
      bucket: config.s3Bucket
    })

    // Get the photo stream from S3
    let photoReadableStream = await photos.getPhotoStream(key)

    // Resize if necessary
    if (!original) {
      photoReadableStream = await photos.resizeImage(photoReadableStream, maxwidth, maxheight)
    }

    return h.response(photoReadableStream)
  }
}

const handlers = new PhotoHandlers()

module.exports = handlers.routes({
  path: '/photos/{size}/{key}',
  app: {
    tags: ['always']
  }
})
