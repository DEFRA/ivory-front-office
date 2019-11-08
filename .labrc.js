const glob = require("glob")
const testFiles = glob.sync('server/**/*.test.js')
const config = {
  paths: testFiles,
  coverage: true,
  threshold: 85,
  'coverage-exclude': testFiles.concat(['test-helper.js']),
  globals: 'version, __core-js_shared__'
}

module.exports = config
