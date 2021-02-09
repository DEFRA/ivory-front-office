
const yaml = require('js-yaml')
const fs = require('fs')
const flowConfig = yaml.safeLoad(fs.readFileSync(`${__dirname}/../flow.yml`, 'utf8'))
const path = require('path')
const plugin = require('./route-flow/index')

module.exports = {
  plugin,
  options: {
    flowConfig,
    handlersDir: path.normalize(`${__dirname}/../modules`)
  }
}

module.exports.test = plugin.test
