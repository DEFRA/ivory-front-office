const BaseCache = require('./baseCache')

class Registration extends BaseCache {}
class Owner extends BaseCache {}
class OwnerAddress extends BaseCache {}
class Agent extends BaseCache {}
class AgentAddress extends BaseCache {}
class Item extends BaseCache {}
class Payment extends BaseCache {}
class Photo extends BaseCache {}

module.exports = {
  Registration,
  Owner,
  OwnerAddress,
  Agent,
  AgentAddress,
  Item,
  Payment,
  Photo
}
