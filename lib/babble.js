var Babbler = require('./Babbler'),
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
 * Create an Action flow node
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the incoming message.
 *                              The return value of fn is send back to the
 *                              sender
 * @param {FlowNode} next           The next flow node
 */
exports.act = function act(callback, next) {
  return new ActionNode(callback, next);
};

/**
 * Create a DecisionNode flow node
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a FlowNode element.
 */
exports.decide = function decide(callback) {
  return new DecisionNode(callback);
};
