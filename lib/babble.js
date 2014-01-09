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
 * @param {Function} callback     Invoked as fn(response),
 *                                where response is the latest message received.
 *                                Must return a Block element.
 * @return {FlowBuilder} builder  A flow builder
 */
exports.decide = function decide(callback) {
  return new FlowBuilder(new Decision(callback));
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
