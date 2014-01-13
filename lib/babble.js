var Babbler = require('./Babbler'),

    Tell = require('./block/Tell'),
    Action = require('./block/Action'),
    Decision = require('./block/Decision');

/**
 * Create a new babbler
 * @param {String} id
 * @return {Babbler} babbler
 */
exports.babbler = function babbler(id) {
  return new Babbler(id);
};

/**
 * Create a control flow starting with a tell block
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The result returned by the function will be
 *                              send back to the sender.
 * @return {Tell} tell
 */
exports.tell = function tell(callback) {
  return new Tell(callback);
};

/**
 * Create a decision block and chain it to the current block.
 * Returns the first block in the chain.
 *
 * Syntax:
 *
 *     decide(choices)
 *     decide(decision, choices)
 *
 * Where:
 *
 *     {Function | Object} [decision]
 *                              When a `decision` function is provided, the
 *                              function is invoked as decision(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The function must return the id for the next
 *                              block in the control flow, which must be
 *                              available in the provided `choices`.
 *                              If `decision` is not provided, the next block
 *                              will be mapped directly from the message.
 *     {Object.<String, Block>} choices
 *                              A map with the possible next blocks in the flow
 *                              The next block is selected by the id returned
 *                              by the decision function.
 *
 * @param {Function | Object} arg1  Can be {function} decision or {Object} choices
 * @param {Object} [arg2]           choices
 * @return {Block} decision         The created decision block
 */
exports.decide = function decide(arg1, arg2) {
  // TODO: test arguments.length > 2
  return new Decision(arg1, arg2);
};

/**
 * Create a control flow starting with an action block
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Action} action
 */
exports.run = function run (callback) {
  return new Action(callback);
};

// export the babbler prototype
exports.Babbler = Babbler;

// export all flow blocks
exports.block = {
  Block: require('./block/Block'),
  Action: require('./block/Action'),
  Decision: require('./block/Decision'),
  Listen: require('./block/Listen'),
  Tell: require('./block/Tell')
};

// export pubsub interfaces
exports.pubsub = require('./pubsub');
