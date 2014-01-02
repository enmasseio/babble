var Block = require('./Block');

/**
 * Trigger
 * Create an event trigger. When triggered, the next Block element will be
 * invoked.
 * @param {Block} [next] The next block in the control flow
 * @constructor
 * @extends {Block}
 */
function Trigger (next) {
  if (!(this instanceof Trigger)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }

  this.next = next;
}

Trigger.prototype = Object.create(Block.prototype);

/**
 * Run the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Trigger.prototype.run = function run (context, arg) {
  return {
    result: undefined,
    block: this.next
  };
};

module.exports = Trigger;
