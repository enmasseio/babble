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
 * Chain a block to the current block. The new block is appended to the *last*
 * block in the chain, and the function returns the *first* block in the chain.
 * @param {Block} next
 * @return {Block} first  First block in the chain
 */
Block.prototype.then = function then (next) {
  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
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

module.exports = Block;