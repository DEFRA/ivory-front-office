// Usage:
// const mixins = require('mixin')
// const object = mixins(original, mixin1, mixin2, mixin3)

module.exports = (original, ...mixins) => {
  function mix (object = original, mixin) {
    const mixinInstance = Object.assign({}, mixin)
    Object.entries(mixinInstance).forEach(([prop, val]) => {
      if (typeof val === 'function') {
        object[prop] = val.bind(object)
      } else {
        object[prop] = val
      }
    })
    return object
  }

  const mixed = mixins.reduce(mix) || mixins.pop()

  return mix(original, mixed)
}
