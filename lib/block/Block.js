'use strict';

/**
 * Abstract control flow diagram block
 * @constructor
 */
function Block() {
  this.next = null;
  this.previous = null;
}

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Block.prototype.execute = function (message, context) {
  throw new Error('Cannot run an abstract Block');
};

module.exports = Block;
