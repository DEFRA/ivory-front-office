
const { awsPhotos } = require('defra-hapi-modules').plugins
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
  plugin: awsPhotos,
  options: {
    path: '/photos',
    alternativeSizes,
    region: config.s3Region,
    apiVersion: config.s3ApiVersion,
    bucket: config.s3Bucket,
    enabled: config.s3Enabled,
    tags: ['always']
  }
}
