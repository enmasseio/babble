/**
 * Abstract control flow diagram block
 * @constructor
 */
function Block() {}

/**
 * Run the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Block.prototype.run = function run (context, arg) {
  throw new Error('Cannot run an abstract Block');
};

module.exports = Block;