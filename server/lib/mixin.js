// Usage:
// const mixins = require('mixin')
// const object = mixins(originalClass, mixin1, mixin2, mixin3)

module.exports = (OriginalClass, ...mixins) => class MixedClass extends OriginalClass {
  constructor () {
    super()
    Object.assign(this, ...mixins)
  }
}
