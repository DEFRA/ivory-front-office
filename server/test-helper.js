module.exports = class TestHelper {
  static async createServer () {
    process.env.ADDRESS_LOOKUP_ENABLED = false
    process.env.AIRBRAKE_ENABLED = false
    return require('../server')()
  }
}
