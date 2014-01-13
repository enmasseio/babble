var Block = require('./Block');

/**
 * Tell
 * Send a message to the other peer.
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The result returned by the function will be
 *                              send back to the sender.
 *                              If no callback is provided, the block will send
 *                              the output from previous block in the chain as
 *                              message.
 * @constructor
 * @extends {Block}
 */
function Tell (callback) {
  if (!(this instanceof Tell)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (callback && !(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback || function (message) {
    return message;
  };
}

Tell.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Tell.prototype.execute = function execute (message, context) {
  var result = this.callback(message, context);

  return {
    result: result,
    block: this.next
  };
};

/**
 * Create a Tell block and chain it to the current block
 * Returns the first block in the chain.
 * @param {* | Function} [message] A static message or callback function
 *                                 returning a message dynamically.
 *                                 When `message` is a function, it will be
 *                                 invoked as callback(message, context),
 *                                 where `message` is the output from the
 *                                 previous block in the chain, and `context` is
 *                                 an object where state can be stored during a
 *                                 conversation.
 * @return {Block} first        First block in the chain
 */
Block.prototype.tell = function tell (message) {
  var callback = (typeof message === 'function') ? message : function () {
    return message;
  };

  var block = new Tell(callback);

  return this.then(block);
};

module.exports = Tell;
