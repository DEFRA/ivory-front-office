module.exports = {
  plugin: require('hapi-router'),
  options: {
    routes: 'server/**/*route.js' // recursively match all js files in the routes directory
  }
}
