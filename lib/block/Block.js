/**
 * Abstract control flow diagram block
 * @constructor
 */
function Block() {}

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
 * Specify the next block in the chain
 * @param {Block} next
 */
Block.prototype.chain = function chain(next) {
  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }

  this.next = next;
};

module.exports = Block;