var Block = require('./Block');

/**
 * Decision
 * A decision is made by executing the provided callback function, which returns
 * a next Action.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a Block element.
 * @constructor
 * @extends {Block}
 */
function Decision (callback) {
  if (!(this instanceof Decision)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback;
}

Decision.prototype = Object.create(Block.prototype);

/**
 * Run the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Decision.prototype.run = function run (context, arg) {
  var next = this.callback.apply(context, (arg !== undefined) ? [arg] : []);

  if (next && !(next instanceof Block)) {
    throw new TypeError('Decision function must return a Block');
  }

  return {
    result: undefined,
    block: next
  };
};

module.exports = Decision;
