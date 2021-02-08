// Usage:
// const mixins = require('mixin')
// const object = mixins(originalClass, mixin1, mixin2, mixin3)
const { merge } = require('lodash')

module.exports = (OriginalClass, ...mixins) => class MixedClass extends OriginalClass {
  constructor (...args) {
    super(...args)
    merge(this, ...mixins)
  }
}
