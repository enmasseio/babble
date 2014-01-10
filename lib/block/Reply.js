var Block = require('./Block');

/**
 * Reply
 * Send a message to the other peer.
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The result returned by the function will be
 *                              send back to the sender.
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
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Reply.prototype.execute = function execute (message, context) {
  var result = this.callback(message, context);

  return {
    result: result,
    block: this.next
  };
};

/**
 * Create a Reply block and chain it to the current block
 * Returns the first block in the chain.
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The result returned by the function will be
 *                              send back to the sender.
 * @return {Block} first        First block in the chain
 */
Block.prototype.reply = function reply (callback) {
  var block = new Reply(callback);

  return this.then(block);
};

module.exports = Reply;
