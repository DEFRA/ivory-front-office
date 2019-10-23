const Photos = require('../../lib/photos/photos')
const config = require('../../config')

module.exports = {
  method: 'GET',
  path: '/photos/{key}',
  options: {
    handler: async (request, h) => {
      const key = encodeURIComponent(request.params.key)

      const photos = new Photos({
        region: config.s3Region,
        apiVersion: config.s3ApiVersion,
        bucket: config.s3Bucket
      })

      const photoStream = await photos.getPhotoStream(key)
      return h.response(photoStream)
    },
    tags: ['always']
  }
}
