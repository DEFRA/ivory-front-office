module.exports = {
  plugin: require('@hapi/crumb'),
  options: {
    cookieOptions: {
      isSecure: false
    }
  }
}
