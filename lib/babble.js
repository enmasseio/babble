'use strict';

var Babbler = require('./Babbler');

var Tell = require('./block/Tell');
var Then = require('./block/Then');
var Decision = require('./block/Decision');

/**
 * Create a new babbler
 * @param {String} id
 * @return {Babbler} babbler
 */
exports.babbler = function (id) {
  return new Babbler(id);
};

/**
 * Create a control flow starting with a tell block
 * @param {* | Function} [message] A static message or callback function
 *                                 returning a message dynamically.
 *                                 When `message` is a function, it will be
 *                                 invoked as callback(message, context),
 *                                 where `message` is the output from the
 *                                 previous block in the chain, and `context` is
 *                                 an object where state can be stored during a
 *                                 conversation.
 * @return {Tell} tell
 */
exports.tell = function (message) {
  var callback = (typeof message === 'function') ? message : function () {
    return message;
  };

  return new Tell(callback);
};

/**
 * Send a question, listen for a response.
 * Creates two blocks: Tell and Listen.
 * This is equivalent of doing `babble.tell(message).listen(callback)`
 * @param {* | Function} message
 * @param {Function} [callback]   Callback called
 * @return {Block} block          Last block in the created control flow
 */
exports.ask = function (message, callback) {
  return exports
      .tell(message)
      .listen(callback);
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
exports.decide = function (arg1, arg2) {
  // TODO: test arguments.length > 2
  return new Decision(arg1, arg2);
};

/**
 * Create a control flow starting with a Then block
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Then} then
 */
exports.then = function (callback) {
  return new Then(callback);
};

// export the babbler prototype
exports.Babbler = Babbler;

// export all flow blocks
exports.block = {
  Block: require('./block/Block'),
  Then: require('./block/Then'),
  Decision: require('./block/Decision'),
  Listen: require('./block/Listen'),
  Tell: require('./block/Tell')
};

// export messaging interfaces
exports.messagers = require('./messagers');
