const glob = require("glob")
const files = glob.sync('./server/**/*.test.js')

module.exports = {
  paths: files,
  coverage: true,
  threshold: 80,
  globals: '__core-js_shared__'
}