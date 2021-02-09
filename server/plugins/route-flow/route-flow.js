const { Flow, RouteFlowEngine } = require('./flow')

module.exports = {
  Flow,
  register: async (server, options = {}) => {
    const { flowConfig: config, handlersDir } = options

    server.app.flow = async (routeId) => {
      return RouteFlowEngine.flow(routeId)
    }

    const resolveQuery = async (...args) => {
      return Flow.resolveQuery(...args)
    }

    const createRoutes = async (node) => {
      return Flow.createRoutes(node, server, handlersDir)
    }

    return new RouteFlowEngine({ config, createRoutes, resolveQuery })
  }
}
