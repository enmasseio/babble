'use strict';

var Block = require('./Block');

/**
 * Listen
 * Wait until a message comes in from the connected peer, then continue
 * with the next block in the control flow.
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation.
 *                              If callback is provided, the returned result of
 *                              the callback function is passed to the next
 *                              block, else, the received message is passed.
 * @constructor
 * @extends {Block}
 */
function Listen (callback) {
  if (!(this instanceof Listen)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (callback && !(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback || function (message) {
    return message;
  };
}

Listen.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Listen.prototype.execute = function (message, context) {
  var result = this.callback(message, context);

  return {
    result: result,
    block: this.next
  };
};

/**
 * Create a Listen block and chain it to the current block
 * Returns the first block in the chain.
 * @param {Function} [callback] Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {Block} first        First block in the chain
 */
Block.prototype.listen = function (callback) {
  var block = new Listen(callback);

  return this.then(block);
};

module.exports = Listen;
