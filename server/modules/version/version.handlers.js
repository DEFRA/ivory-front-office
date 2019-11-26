class VersionHandlers extends require('defra-hapi-modules').version.handlers {
  get serviceApi () {
    const { serviceApi } = require('../../config')
    return serviceApi
  }

  get repoPath () {
    return __dirname
  }
}

module.exports = VersionHandlers
