var Block = require('./Block');

/**
 * Start of a control flow
 * @constructor
 * @extends {Block}
 */
function Start () {
  if (!(this instanceof Start)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }
}

Start.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Start.prototype.execute = function execute (context, arg) {
  return {
    result: undefined,
    block: this.next
  };
};

module.exports = Start;
