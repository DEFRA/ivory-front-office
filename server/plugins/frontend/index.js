exports.plugin = {
  name: 'hapi-govuk-frontend',
  register: require('./view'),
  once: true
}
