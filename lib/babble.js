var Babbler = require('./Babbler'),
    ReplyNode = require('./flow/ReplyNode'),
    ActionNode = require('./flow/ActionNode'),
    DecisionNode = require('./flow/DecisionNode');

/**
 * Create a new babbler
 * @param {String} id
 * @return {Babbler} babbler
 */
exports.babbler = function babbler(id) {
  return new Babbler(id);
};

/**
 * Create a reply node
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the incoming message.
 *                              The return value of fn is send back to the
 *                              sender
 * @param {FlowNode} next           The next flow node
 */
exports.reply = function reply(callback, next) {
  return new ReplyNode(callback, next);
};

/**
 * Create a decision node
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a FlowNode element.
 */
exports.decide = function decide(callback) {
  return new DecisionNode(callback);
};

/**
 * Create an action node
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 */
exports.run = function run (callback) {
  return new ActionNode(callback);
};
