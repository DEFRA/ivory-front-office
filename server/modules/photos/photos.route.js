const photos = require('../../lib/photos/photos')

module.exports = {
  method: 'GET',
  path: '/photos/{key}',
  options: {
    handler: async (request, h) => {
      const key = encodeURIComponent(request.params.key)
      const photoStream = await photos.getPhotoStream(key)
      return h.response(photoStream)
    }
  }
}
