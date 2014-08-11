'use strict';

var Promise = require('es6-promise').Promise;
var Block = require('./Block');
var Then = require('./Then');

/**
 * Listen
 * Wait until a message comes in from the connected peer, then continue
 * with the next block in the control flow.
 *
 * @constructor
 * @extends {Block}
 */
function Listen () {
  if (!(this instanceof Listen)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }
}

Listen.prototype = Object.create(Block.prototype);
Listen.prototype.constructor = Listen;

/**
 * Execute the block
 * @param {Conversation} conversation
 * @param {*} [message]   Message is ignored by Listen blocks
 * @return {Promise.<{result: *, block: Block}, Error>} next
 */
Listen.prototype.execute = function (conversation, message) {
  var me = this;

  // wait until a message is received
  return conversation.receive()
      .then(function (message) {
        return {
          result: message,
          block: me.next
        }
      });
};

/**
 * Create a Listen block and chain it to the current block
 *
 * Optionally a callback function can be provided, which is equivalent of
 * doing `listen().then(callback)`.
 *
 * @param {Function} [callback] Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {Block}              Returns the appended block
 */
Block.prototype.listen = function (callback) {
  var listen = new Listen();
  var block = this.then(listen);
  if (callback) {
    block = block.then(callback);
  }
  return block;
};

module.exports = Listen;
