
const { routeFlow } = require('ivory-common-modules').plugins
const yaml = require('js-yaml')
const fs = require('fs')
const flowConfig = yaml.safeLoad(fs.readFileSync(`${__dirname}/../flow.yml`, 'utf8'))
const path = require('path')

module.exports = {
  plugin: routeFlow,
  options: {
    flowConfig,
    handlersDir: path.normalize(`${__dirname}/../modules`)
  }
}
