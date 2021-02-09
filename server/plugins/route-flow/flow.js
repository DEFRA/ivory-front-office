const { RouteFlowEngine } = require('./route-flow-engine')

class Flow {
  static async createRoutes (node, server, handlersDir) {
    class Handlers extends require(`${handlersDir}/${node.handlers}`) {
      static get server () {
        return server
      }

      get flowNode () {
        return node
      }

      async getFlowNode (nodeId) {
        return server.app.flow(nodeId)
      }

      async getNextPath (...args) {
        const nextNode = await node.next(...args)
        return nextNode.path
      }

      async getPageHeading (...args) {
        if (typeof node.title === 'function') {
          return node.title(...args)
        } else {
          return super.getPageHeading(...args)
        }
      }
    }

    const handlers = node.handlers = new Handlers()

    if (handlers.getPayload) {
      handlers.payload = await handlers.getPayload()
    }

    const { path, isQuestionPage = false, view, tags = [] } = node
    const routes = handlers.routes({
      path,
      app: {
        view,
        isQuestionPage,
        tags
      }
    })

    routes.forEach((route) => server.route(route))
  }

  static async resolveQuery (routes, query, ...args) {
    return routes.handlers[query](...args)
  }

  static get RouteFlowEngine () {
    return RouteFlowEngine
  }
}

module.exports = {
  Flow,
  RouteFlowEngine
}
