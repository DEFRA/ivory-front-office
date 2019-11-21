const { Persistence } = require('ivory-shared')
const moment = require('moment')
const { serviceApi } = require('../../config')
const persistence = new Persistence({ path: `${serviceApi}/version` })
const { name, homepage, version } = require('../../../package')
const git = require('git-last-commit')

class VersionHandlers extends require('ivory-common-modules').handlers {
  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { info: instance } = request.server
    const commit = await new Promise((resolve, reject) => {
      git.getLastCommit((err, commit) => {
        if (err) {
          reject(err)
        } else {
          resolve(commit)
        }
      })
    })
    Object.assign(commit, { name, version, commit: homepage.replace('#readme', `/commit/${commit.hash}`), instance })
    const services = [commit, await persistence.restore()]
    services.forEach((service) => {
      const { instance } = service
      instance.startedTimestamp = moment(instance.started).format('DD/MM/YYYY HH:mm:ss')
    })
    this.viewData = { services, renderTimestamp: moment().format('DD/MM/YYYY HH:mm:ss') }
    return super.handleGet(request, h, errors)
  }
}

module.exports = VersionHandlers
