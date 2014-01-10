var Block = require('./Block');

/**
 * Action
 * Execute an action.
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @constructor
 * @extends {Block}
 */
function Action (callback) {
  if (!(this instanceof Action)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback;
}

Action.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Action.prototype.execute = function execute (message, context) {
  var result = this.callback(message, context);

  return {
    result: result,
    block: this.next
  };
};

/**
 * Create an action block and chain it to the current block.
 * Returns the first block in the chain.
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Block} first        First block in the chain
 */
Block.prototype.run = function run (callback) {
  var action = new Action(callback);

  return this.then(action);
};

module.exports = Action;
