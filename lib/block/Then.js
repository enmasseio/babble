'use strict';

var Promise = require('es6-promise').Promise;
var Block = require('./Block');
var isPromise = require('../util').isPromise;

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
Then.prototype.constructor = Then;

/**
 * Execute the block
 * @param {Conversation} conversation
 * @param {*} message
 * @return {Promise.<{result: *, block: Block}, Error>} next
 */
Then.prototype.execute = function (conversation, message) {
  var me = this;
  var result = this.callback(message, conversation.context);

  var resolve = isPromise(result) ? result : Promise.resolve(result);

  return resolve.then(function (result) {
    return {
      result: result,
      block: me.next
    }
  });
};

/**
 * Chain a block to the current block.
 *
 * When a function is provided, a Then block will be generated which
 * executes the function. The function is invoked as callback(message, context),
 * where `message` is the output from the previous block in the chain,
 * and `context` is an object where state can be stored during a conversation.
 *
 * @param {Block | function} next   A callback function or Block.
 * @return {Block} Returns the appended block
 */
Block.prototype.then = function (next) {
  // turn a callback function into a Then block
  if (typeof next === 'function') {
    next = new Then(next);
  }

  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block or function');
  }

  // append after the last block
  next.previous = this;
  this.next = next;

  // return the appended block
  return next;
};

module.exports = Then;
