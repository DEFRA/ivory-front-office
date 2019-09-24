const { Persistence } = require('ivory-shared')
const moment = require('moment')
const { serviceApi } = require('../../config')
const persistence = new Persistence({ path: `${serviceApi}/version` })
const { name, homepage, version } = require('../../../package')
const git = require('git-last-commit')

class VersionHandlers extends require('../common/handlers') {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const commit = await new Promise((resolve, reject) => {
      git.getLastCommit((err, commit) => {
        if (err) {
          reject(err)
        } else {
          resolve(commit)
        }
      })
    })
    Object.assign(commit, { name, version, commit: homepage.replace('#readme', `/commit/${commit.hash}`) })
    const services = [commit, await persistence.restore()]
    this.viewData = { services, renderTimestamp: moment().format('DD/MM/YYYY HH:mm:ss') }
    return super.handleGet(request, h, errors)
  }
}

const handlers = new VersionHandlers()

module.exports = handlers.routes({
  path: '/version',
  app: {
    pageHeading: 'Version',
    view: 'version/version',
    tags: ['always']
  }
})
