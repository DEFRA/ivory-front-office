// Usage:
// const mixins = require('mixin')
// const object = mixins(originalClass, mixin1, mixin2, mixin3)
const merge = require('lodash.merge')

module.exports = (OriginalClass, ...mixins) => class MixedClass extends OriginalClass {
  constructor () {
    super()
    merge(this, ...mixins)
  }
}
