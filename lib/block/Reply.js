var Block = require('./Block');

/**
 * Reply
 * Handle a reply to a message.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the last received message.
 *                              The returned result will be send back to the
 *                              sender.
 * @param {Block} [next]        The next block in the control flow
 * @constructor
 * @extends {Block}
 */
function Reply (callback, next) {
  if (!(this instanceof Reply)) {
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

Reply.prototype = Object.create(Block.prototype);

/**
 * Run the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Reply.prototype.run = function run (context, arg) {
  var result = this.callback.apply(context, (arg !== undefined) ? [arg] : []);

  if (result === undefined) {
    throw new Error('Callback of Reply returned undefined');
  }

  return {
    result: result,
    block: this.next
  };
};

module.exports = Reply;
