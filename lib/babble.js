var Babbler = require('./Babbler'),
    Action = require('./flow/Action'),
    Reply = require('./flow/Reply'),
    Decision = require('./flow/Decision');

/**
 * Create a new babbler
 * @param {String} id
 * @return {Babbler} babbler
 */
exports.babbler = function babbler(id) {
  return new Babbler(id);
};

/**
 * Create an Action flow element
 * @param {Function } callback  Function is invoked as callback(response),
 *                              where response is the latest received message.
 *                              Function must return nothing.
 * @param {Flow} next           The next flow element
 */
exports.act = function act(callback, next) {
  return new Action(callback, next);
};

/**
 * Create a Reply flow element
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the incoming message.
 *                              The return value of fn is send back to the
 *                              sender
 * @param {Flow} next           The next flow element
 */
exports.reply = function reply(callback, next) {
  return new Reply(callback, next);
};

/**
 * Create a Decision flow element
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a Flow element.
 */
exports.decide = function decide(callback) {
  return new Decision(callback);
};
