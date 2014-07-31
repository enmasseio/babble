'use strict';

var Block = require('./Block');

/**
 * Then
 * Execute a callback function or a next block in the chain.
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @constructor
 * @extends {Block}
 */
function Then (callback) {
  if (!(this instanceof Then)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback;
}

Then.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Then.prototype.execute = function (message, context) {
  var result = this.callback(message, context);

  return {
    result: result,
    block: this.next
  };
};

/**
 * Chain a block to the current block. The new block is appended to the *last*
 * block in the chain, and the function returns the *first* block in the chain.
 *
 * When a function is provided, a Then block will be generated which
 * executes the function. The function is invoked as callback(message, context),
 * where `message` is the output from the previous block in the chain,
 * and `context` is an object where state can be stored during a conversation.
 *
 * @param {Block | function} next
 * @return {Block} first  First block in the chain
 */
Block.prototype.then = function (next) {
  // turn a callback function into a Then block
  if (typeof next === 'function') {
    next = new Then(next);
  }

  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block or function');
  }

  // find the last block in the chain
  var last = this;
  while (last.next) {
    last = last.next;
  }

  // find the first block in the chain.
  var first = this;
  while (first.previous) {
    first = first.previous;
  }

  // append after the last block
  next.previous = this;
  last.next = next;

  // return the first block
  return first;
};

module.exports = Then;
