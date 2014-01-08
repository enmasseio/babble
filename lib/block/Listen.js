var Block = require('./Block');

/**
 * Listen
 * Create an event listener.
 * @param {Function} [next]   Function executed when the block is triggered
 * @constructor
 * @extends {Block}
 */
function Listen (next) {
  if (!(this instanceof Listen)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  /* TODO: cleanup
  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }
  */

  this.next = next;
}

Listen.prototype = Object.create(Block.prototype);

/**
 * Run the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Listen.prototype.run = function run (context, arg) {
  return {
    result: undefined,
    block: this.next
  };
};

module.exports = Listen;
