var Block = require('./Block');

/**
 * Reply
 * Handle a reply to a message.
 * @param {Function} callback   Invoked as callback(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can
 *                              be stored during a conversation.
 *                              The function must return something, the
 *                              returned result will be send back to the sender.
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
 * Execute the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Reply.prototype.execute = function execute (context, arg) {
  var result = this.callback(arg, context);

  if (result === undefined) {
    throw new Error('Callback of Reply returned undefined');
  }

  return {
    result: result,
    block: this.next
  };
};

module.exports = Reply;
