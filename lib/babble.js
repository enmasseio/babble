var Babbler = require('./Babbler'),

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
 * Create a reply block
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the incoming message.
 *                              The return value of fn is send back to the
 *                              sender
 * @param {Block} next          The next block
 */
exports.reply = function reply(callback, next) {
  return new Reply(callback, next);
};

/**
 * Create a decision block
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a Block element.
 */
exports.decide = function decide(callback) {
  return new Decision(callback);
};

/**
 * Create an action block
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 * @param {Block} next          The next block
 */
exports.run = function run (callback, next) {
  return new Action(callback, next);
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
