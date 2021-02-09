const { Flow, register } = require('./route-flow')

exports.plugin = {
  name: 'defra-hapi-route-flow',
  register,
  once: true
}

// Expose Flow through test object to aid unit testing
exports.test = { Flow }
