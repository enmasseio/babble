var Block = require('./Block');

/**
 * Action
 * Execute an action.
 * @param {Function} callback   Invoked as callback(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can
 *                              be stored during a conversation.
 *                              The callback should return nothing.
 * @param {Block} [next]        The next block in the control flow
 * @constructor
 * @extends {Block}
 */
function Action (callback, next) {
  if (!(this instanceof Action)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  if (next && !(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }

  this.callback = callback;
  this.next = next;
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

module.exports = Action;
