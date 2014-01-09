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
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Block.prototype.execute = function execute (context, arg) {
  throw new Error('Cannot run an abstract Block');
};

/**
 * Chain a block to the current block
 * @param {Block} next
 * @return {Block} next
 */
Block.prototype.then = function then (next) {
  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }

  next.previous = this;
  this.next = next;

  return next;
};

/**
 * Get the first block in this control flow
 * @return {Block} first
 */
Block.prototype.done = function done() {
  var block = this;
  while (block.previous) {
    block = block.previous;
  }
  return block;
};

module.exports = Block;