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
 * @constructor
 * @extends {Block}
 */
function Reply (callback) {
  if (!(this instanceof Reply)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback;
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

/**
 * Create a Reply block and chain it to the current block
 * Returns the first block in the chain.
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {Block} first        First block in the chain
 */
Block.prototype.reply = function reply (callback) {
  var block = new Reply(callback);

  return this.then(block);
};

module.exports = Reply;
