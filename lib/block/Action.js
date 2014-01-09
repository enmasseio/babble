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
 * @param {Object} context
 * @param {String} [arg=undefined]
 * @return {{result: *, block: Block}} next
 */
Action.prototype.execute = function execute (context, arg) {
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
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 * @return {Action} block
 */
Block.prototype.run = function run (callback) {
  var action = new Action(callback);

  this.then(action);

  return action;
};

module.exports = Action;
