'use strict';

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

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Listen.prototype.execute = function (message, context) {
  return {
    result: message,
    block: this.next
  };
};

/**
 * Create a Listen block and chain it to the current block
 * Returns the first block in the chain.
 *
 * Optionally a callback function can be provided, which is equivalent of
 * doing `listen().then(callback)`.
 *
 * @param {Function} [callback] Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {Block} first        First block in the chain
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
