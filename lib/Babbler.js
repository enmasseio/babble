'use strict';

var uuid = require('node-uuid');
var Promise = require('es6-promise').Promise;

var messagers = require('./messagers');
var Block = require('./block/Block');
var Then = require('./block/Then');
var Tell = require('./block/Tell');
var Listen = require('./block/Listen');

/**
 * Babbler
 * @param {String} id
 * @constructor
 */
function Babbler (id) {
  if (!(this instanceof Babbler)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!id) {
    throw new Error('id required');
  }

  this.id = id;
  this.listeners = {};
  this.conversations = {};

  this.connect(); // automatically connect to the local message bus
}

/**
 * Connect to a messaging system
 * @param {{connect: function, disconnect: function, send: function}} [messager]
 *          A messaging interface. Must have the following functions:
 *          - connect(params: {id: string,
 *            message: function, connect: function}) : string
 *            must return a token to disconnects again.
 *            parameter connect is optional.
 *          - disconnect(token: string)
 *            disconnect from a messager.
 *          - send(id: string, message: *)
 *            send a message
 *          A number of interfaces is provided under babble.messagers.
 *          Default interface is babble.messagers['default']
 * @return {Promise.<Babbler>}  Returns a Promise which resolves when the
 *                              babbler is connected.
 */
Babbler.prototype.connect = function (messager) {
  // disconnect (in case we are already connected)
  this.disconnect();

  if (!messager) {
    messager = messagers['default']();
  }

  // validate the messagers fucntions
  if (typeof messager.connect !== 'function') {
    throw new Error('messager must contain a function ' +
        'connect(params: {id: string, callback: function}) : string');
  }
  if (typeof messager.disconnect !== 'function') {
    throw new Error('messager must contain a function ' +
        'disconnect(token: string)');
  }
  if (typeof messager.send !== 'function') {
    throw new Error('messager must contain a function ' +
        'send(params: {id: string, message: *})');
  }

  // we return a promise, but we run the message.connect function immediately
  // (outside of the Promise), so that synchronous connects are done without
  // the need to await the promise to resolve on the next tick.
  var _resolve;
  var connected = new Promise(function (resolve, reject) {
    _resolve = resolve;
  });

  var token = messager.connect({
    id: this.id,
    message: this._onMessage.bind(this),
    connect: _resolve
  });

  // link functions to disconnect and send
  this.disconnect = function () {
    messager.disconnect(token);
  };
  this.send = messager.send;

  // return a promise
  return connected;
};

/**
 * Handle an incoming message
 * @param {{id: string, from: string, to: string, message: string}} envelope
 * @returns {boolean} Returns true when a message has been handled, else returns
 *                    false
 * @private
 */
Babbler.prototype._onMessage = function (envelope) {
  var conversation;
  var trigger;
  var message = envelope.message;

  //console.log('message', this.id, envelope); // TODO: cleanup

  // check the open conversations
  conversation = this.conversations[envelope.id];
  if (conversation) {
    this._run(conversation, message);
    return true;
  }
  else {
    // check the listeners to start a new conversation
    trigger = this.listeners[message];
    if (trigger) {
      //console.log('message create a new conversation', trigger, trigger.callback); // TODO: cleanup
      // create a new conversation
      conversation = {
        id: envelope.id,
        peer: envelope.from,
        next: trigger,
        context: {
          from: envelope.from
        }
      };

      this._run(conversation, message);
      return true;
    }
  }

  return false;
};

/**
 * Disconnect from the babblebox
 */
Babbler.prototype.disconnect = function () {
  // by default, do nothing. The disconnect function will be overwritten
  // when the Babbler is connected to a message bus.
};

/**
 * Send a message
 * @param {String} id
 * @param {*} message
 */
Babbler.prototype.send = function (id, message) {
  // send is overridden when running connect
  throw new Error('Cannot send: not connected');
};

/**
 * Listen for a specific event
 * @param {String} message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Start block of a control flow.
 */
// TODO: remove callback from listen
Babbler.prototype.listen = function (message, callback) {
  if (typeof message !== 'string') {
    throw new TypeError('Parameter message must be a string');
  }

  // TODO: add support for a string as callback

  var listen = new Listen(callback);

  this.listeners[message] = listen;

  return listen;
};

/**
 * Send a message to the other peer
 * Creates a block Tell, and runs the block immediately.
 * @param {String} id       Babbler id
 * @param {Function | *} message
 * @return {Block} block    Last block in the created control flow
 */
Babbler.prototype.tell = function (id, message) {
  var cid = uuid.v4(); // create an id for this conversation

  var block = new Tell();

  // create a new conversation
  var conversation = {
    id: cid,
    peer: id,
    next: block,
    context: {
      from: id
    }
  };

  // override the `then` function, so we can immediately execute chained blocks
  // until we encounter a Listen block.
  var me = this;
  block.then = function then (next) {
    // turn a callback function into a Then block
    if (typeof next === 'function') {
      next = new Then(next);
    }

    if (!(next instanceof Block)) {
      throw new TypeError('Parameter next must be a Block or function');
    }

    conversation.next = next;

    if (next instanceof Listen) {
      // add to the conversations queue
      me.conversations[cid] = conversation;
    }
    else {
      // execute immediately
      message = me._run(conversation, message);
      next.then = then;
    }

    return next;
  };

  // run the Tell block immediately
  message = this._run(conversation, message);

  return block;
};

/**
 * Create a control flow starting with a Then block
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Then} then
 */
/* TODO: implement Babbler.then
Babbler.prototype.then = function (callback) {

};
*/

/**
 * Send a question, listen for a response.
 * Creates two blocks: Tell and Listen, and runs them immediately.
 * This is equivalent of doing `Babbler.tell(id, message).listen(callback)`
 * @param {String} id             Babbler id
 * @param {* | Function} message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Last block in the created control flow
 */
Babbler.prototype.ask = function (id, message, callback) {
  return this
      .tell(id, message)
      .listen(callback);
};

/**
 * Run next block for given conversation
 * @param {Object} conversation
 * @param {*} [message]
 * @return {*} message    Response returned by the last executed block
 * @private
 */
Babbler.prototype._run = function (conversation, message) {
  // console.log('_run', conversation, message); // TODO: cleanup

  // remove the conversation from the queue
  delete this.conversations[conversation.id];

  var block = conversation.next;
  do {
    var next = block.execute(message, conversation.context);
    message = next.result;

    if (block.next instanceof Listen) {
      // wait for a next incoming message
      // Note: we add this listener *before* we send a message,
      // this is needed in case the reply is send synchronously
      conversation.next = block.next;
      this.conversations[conversation.id] = conversation;
    }

    if (block instanceof Tell) {
      // send a response back to the other peer
      this.send(conversation.peer, {
        id: conversation.id,
        from: this.id,
        to: conversation.peer,
        message: message
      });
    }

    block = next.block;
  }
  while (block && !(block instanceof Listen));

  return message;
};

module.exports = Babbler;
