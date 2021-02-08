
const { plugin } = require('./photos/index')
const config = require('../config')

const alternativeSizes = [
  {
    width: config.photoSmallMaxWidth,
    height: config.photoSmallMaxHeight,
    type: config.photoSmallPrefix
  },
  {
    width: config.photoMediumMaxWidth,
    height: config.photoMediumMaxHeight,
    type: config.photoMediumPrefix
  }
]

module.exports = {
  plugin,
  options: {
    path: '/photos',
    alternativeSizes,
    region: config.s3Region,
    apiVersion: config.s3ApiVersion,
    bucket: config.s3Bucket,
    enabled: config.s3Enabled,
    maxMb: config.photoUploadPhotoMaxMb,
    minKb: config.photoUploadPhotoMinKb,
    payloadMaxBytes: config.photoUploadPayloadMaxBytes,
    options: { // route options
      tags: ['always']
    }
  }
}
