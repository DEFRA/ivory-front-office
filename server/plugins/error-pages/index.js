exports.plugin = {
  name: 'defra-hapi-error-handling',
  register: require('./lib/error-handling'),
  once: true
}
