// Suppress MaxListenersExceededWarning within tests
require('events').EventEmitter.defaultMaxListeners = Infinity
const { logger } = require('defra-logging-facade')

module.exports = class TestHelper {
  static stubCommon (sandbox) {
    sandbox.stub(logger, 'debug').value(() => undefined)
    sandbox.stub(logger, 'info').value(() => undefined)
    sandbox.stub(logger, 'warn').value(() => undefined)
    sandbox.stub(logger, 'error').value(() => undefined)
    sandbox.stub(logger, 'serverError').value(() => undefined)
  }

  static getFile (filename) {
    return filename.substring(__dirname.length)
  }
}
