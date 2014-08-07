var uuid = require('node-uuid');
var Promise = require('es6-promise').Promise;

/**
 * A conversation
 * Holds meta data for a conversation between two peers
 * @param {Object} [config] Configuration options:
 *                          {string} [id]      A unique id for the conversation. If not provided, a uuid is generated
 *                          {string} self      Id of the peer on this side of the conversation
 *                          {string} other     Id of the peer on the other side of the conversation
 *                          {Object} [context] Context passed with all callbacks of the conversation
 *                          {function(to: string, message: *): Promise} send   Function to send a message
 * @constructor
 */
function Conversation (config) {
  if (!(this instanceof Conversation)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  // public properties
  this.id =       config && config.id       || uuid.v4();
  this.self =     config && config.self     || null;
  this.other =    config && config.other    || null;
  this.context =  config && config.context  || {};

  // private properties
  this._send =    config && config.send     || null;
  this._inbox = [];     // queue with received but not yet picked messages
  this._receivers = []; // queue with handlers waiting for a new message
}

/**
 * Send a message
 * @param {*} message
 * @return {Promise.<null>} Resolves when the message has been sent
 */
Conversation.prototype.send = function (message) {
  return this._send(this.other, {
    id: this.id,
    from: this.self,
    to: this.other,
    message: message
  });
};

/**
 * Deliver a message
 * @param {{id: string, from: string, to: string, message: string}} envelope
 */
Conversation.prototype.deliver = function (envelope) {
  if (this._receivers.length) {
    var receiver = this._receivers.shift();
    receiver(envelope.message);
  }
  else {
    this._inbox.push(envelope.message);
  }
};

/**
 * Receive a message.
 * @returns {Promise.<*>} Resolves with a message as soon as a message
 *                        is delivered.
 */
Conversation.prototype.receive = function () {
  var me = this;

  if (this._inbox.length) {
    return Promise.resolve(this._inbox.shift());
  }
  else {
    return new Promise(function (resolve) {
      me._receivers.push(resolve);
    })
  }
};

module.exports = Conversation;
