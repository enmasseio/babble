var Block = require('./Block');

/**
 * Action
 * Execute an action.
 * @param {Function} callback   Invoked as callback(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can
 *                              be stored during a conversation.
 *                              The callback should return nothing.
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
 * @param {String} arg
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Action.prototype.execute = function execute (arg, context) {
  var result = this.callback(arg, context);

  if (result !== undefined) {
    throw new Error('Callback of Action must return undefined');
  }

  return {
    result: undefined,
    block: this.next
  };
};

/**
 * Create an action block and chain it to the current block.
 * Returns the first block in the chain.
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 * @return {Block} first        First block in the chain
 */
Block.prototype.run = function run (callback) {
  var action = new Action(callback);

  return this.then(action);
};

module.exports = Action;
