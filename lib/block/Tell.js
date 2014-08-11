'use strict';

var Promise = require('es6-promise').Promise;
var Block = require('./Block');
var isPromise = require('../util').isPromise;

require('./Then');   // extend Block with function then
require('./Listen'); // extend Block with function listen

/**
 * Tell
 * Send a message to the other peer.
 * @param {* | Function} message  A static message or callback function
 *                                returning a message dynamically.
 *                                When `message` is a function, it will be
 *                                invoked as callback(message, context),
 *                                where `message` is the output from the
 *                                previous block in the chain, and `context` is
 *                                an object where state can be stored during a
 *                                conversation.
 * @constructor
 * @extends {Block}
 */
function Tell (message) {
  if (!(this instanceof Tell)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  this.message = message;
}

Tell.prototype = Object.create(Block.prototype);
Tell.prototype.constructor = Tell;

/**
 * Execute the block
 * @param {Conversation} conversation
 * @param {*} [message] A message is ignored by the Tell block
 * @return {Promise.<{result: *, block: Block}, Error>} next
 */
Tell.prototype.execute = function (conversation, message) {
  // resolve the message
  var me = this;
  var resolve;
  if (typeof this.message === 'function') {
    var result = this.message(message, conversation.context);
    resolve = isPromise(result) ? result : Promise.resolve(result);
  }
  else {
    resolve = Promise.resolve(this.message); // static string or value
  }

  return resolve
      .then(function (result) {
        var res = conversation.send(result);
        var done = isPromise(res) ? res : Promise.resolve(res);

        return done.then(function () {
            return {
              result: result,
              block: me.next
            };
          });
      });
};

/**
 * Create a Tell block and chain it to the current block
 * @param {* | Function} [message] A static message or callback function
 *                                 returning a message dynamically.
 *                                 When `message` is a function, it will be
 *                                 invoked as callback(message, context),
 *                                 where `message` is the output from the
 *                                 previous block in the chain, and `context` is
 *                                 an object where state can be stored during a
 *                                 conversation.
 * @return {Block}                 Returns the appended block
 */
Block.prototype.tell = function (message) {
  var block = new Tell(message);

  return this.then(block);
};

/**
 * Send a question, listen for a response.
 * Creates two blocks: Tell and Listen.
 * This is equivalent of doing `babble.tell(message).listen(callback)`
 * @param {* | Function} message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block}              Returns the appended block
 */
Block.prototype.ask = function (message, callback) {
  // FIXME: this doesn't work
  return this
      .tell(message)
      .listen(callback);
};

module.exports = Tell;
