var Block = require('./Block');

/**
 * Tell
 * Send a message to the other peer.
 * @param {* | Function} [message]
 *                              Message to be send to the peer.
 *                              When message is a function, the result returned
 *                              by the function will be send back to the sender.
 *                              In that case, the function is invoked as
 *                              callback(message, context), where `message` is
 *                              the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @constructor
 * @extends {Block}
 */
function Tell (message) {
  if (!(this instanceof Tell)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (message === undefined) {
    throw new TypeError('Parameter message is undefined');
  }

  this.message = message;
}

Tell.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Tell.prototype.execute = function execute (message, context) {
  var result;
  if (typeof this.message === 'function') {
    result = this.message(message, context);
  }
  else {
    result = this.message;
  }

  return {
    result: result,
    block: this.next
  };
};

/**
 * Create a Tell block and chain it to the current block
 * Returns the first block in the chain.
 * @param {* | Function} [message]
 *                              Message to be send to the peer.
 *                              When message is a function, the result returned
 *                              by the function will be send back to the sender.
 *                              In that case, the function is invoked as
 *                              callback(message, context), where `message` is
 *                              the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Block} first        First block in the chain
 */
Block.prototype.tell = function tell (message) {
  var block = new Tell(message);

  return this.then(block);
};

module.exports = Tell;
