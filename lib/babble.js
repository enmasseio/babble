var Babbler = require('./Babbler'),
    FlowBuilder = require('./FlowBuilder'),

    Reply = require('./block/Reply'),
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
 * Create a control flow starting with a reply block
 * @param {Function} callback     Invoked as fn(response),
 *                                where response is the incoming message.
 *                                The return value of fn is send back to the
 *                                sender
 * @return {FlowBuilder} builder  A flow builder
 */
exports.reply = function reply(callback) {
  return new FlowBuilder(new Reply(callback));
};

/**
 * Create a control flow starting with a decision block
 * @param {Function | Object} [decision]
 *                              When a `decision` function is provided, the
 *                              function is invoked as decision(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. The function must
 *                              return the id for the next block in the control
 *                              flow, which must be available in the provided
 *                              `options`. If `decision` is not provided, the
 *                              next block will be mapped directly from the
 *                              response.
 * @param {Object.<String, Block>} choices
 *                              A map with the possible next blocks in the flow
 *                              The next block is selected by the id returned
 *                              by the decision function.
 * @return {FlowBuilder} builder  A flow builder
 */
exports.decide = function decide(decision, choices) {
  return new FlowBuilder(new Decision(decision, choices));
};

/**
 * Create a control flow starting with an action block
 * @param {Function} callback     Invoked as fn(response),
 *                                where response is the latest message received.
 * @return {FlowBuilder} builder  A flow builder
 */
exports.run = function run (callback) {
  return new FlowBuilder(new Action(callback));
};

// export the babbler prototype
exports.Babbler = Babbler;

// export all flow blocks
exports.block = {
  Block: require('./block/Block'),
  Action: require('./block/Action'),
  Decision: require('./block/Decision'),
  Listen: require('./block/Start'),
  Reply: require('./block/Reply')
};

// export pubsub interfaces
exports.pubsub = require('./pubsub');
