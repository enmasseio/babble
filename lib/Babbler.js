'use strict';

var uuid = require('node-uuid');
var Promise = require('es6-promise').Promise;

var messagebus = require('./messagebus');
var Conversation = require('./Conversation');
var Block = require('./block/Block');
var Then = require('./block/Then');
var Tell = require('./block/Tell');
var Listen = require('./block/Listen');

require('./block/IIf'); // append iif function to Block

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
  this.listeners = [];      // Array.<Listen>
  this.conversations = {};  // Array.<Array.<Conversation>> all open conversations

  this.connect(); // automatically connect to the local message bus
}

/**
 * Connect to a message bus
 * @param {{connect: function, disconnect: function, send: function}} [bus]
 *          A messaging interface. Must have the following functions:
 *          - connect(params: {id: string,
 *            message: function, callback: function}) : string
 *            must return a token to disconnects again.
 *            parameter callback is optional.
 *          - disconnect(token: string)
 *            disconnect from a message bus.
 *          - send(id: string, message: *)
 *            send a message
 *          A number of interfaces is provided under babble.messagebus.
 *          Default interface is babble.messagebus['default']
 * @return {Promise.<Babbler>}  Returns a Promise which resolves when the
 *                              babbler is connected.
 */
Babbler.prototype.connect = function (bus) {
  // disconnect (in case we are already connected)
  this.disconnect();

  if (!bus) {
    bus = messagebus['default']();
  }

  // validate the message bus functions
  if (typeof bus.connect !== 'function') {
    throw new Error('message bus must contain a function ' +
        'connect(params: {id: string, callback: function}) : string');
  }
  if (typeof bus.disconnect !== 'function') {
    throw new Error('message bus must contain a function ' +
        'disconnect(token: string)');
  }
  if (typeof bus.send !== 'function') {
    throw new Error('message bus must contain a function ' +
        'send(params: {id: string, message: *})');
  }

  // we return a promise, but we run the message.connect function immediately
  // (outside of the Promise), so that synchronous connects are done without
  // the need to await the promise to resolve on the next tick.
  var _resolve = null;
  var connected = new Promise(function (resolve, reject) {
    _resolve = resolve;
  });

  var token = bus.connect({
    id: this.id,
    message: this._receive.bind(this),
    callback: _resolve
  });

  // link functions to disconnect and send
  this.disconnect = function () {
    bus.disconnect(token);
  };
  this.send = bus.send;

  // return a promise
  return connected;
};

/**
 * Handle an incoming message
 * @param {{id: string, from: string, to: string, message: string}} envelope
 * @private
 */
Babbler.prototype._receive = function (envelope) {
  // ignore when envelope does not contain an id and message
  if (!envelope || !('id' in envelope) || !('message' in envelope)) {
    return;
  }

  // console.log('_receive', envelope) // TODO: cleanup

  var me = this;
  var id = envelope.id;
  var conversations = this.conversations[id];
  if (conversations && conversations.length) {
    // directly deliver to all open conversations with this id
    conversations.forEach(function (conversation) {
      conversation.deliver(envelope);
    })
  }
  else {
    // start new conversations at each of the listeners
    if (!conversations) {
      conversations = [];
    }
    this.conversations[id] = conversations;

    this.listeners.forEach(function (block) {
      // create a new conversation
      var conversation = new Conversation({
        id: id,
        self: me.id,
        other: envelope.from,
        context: {
          from: envelope.from
        },
        send: me.send
      });

      // append this conversation to the list with conversations
      conversations.push(conversation);

      // deliver the first message to the new conversation
      conversation.deliver(envelope);

      // process the conversation
      return me._process(block, conversation)
          .then(function() {
            // remove the conversation from the list again
            var index = conversations.indexOf(conversation);
            if (index !== -1) {
              conversations.splice(index, 1);
            }
            if (conversations.length === 0) {
              delete me.conversations[id];
            }
          });
    });
  }
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
 * @param {String} to  Id of a babbler
 * @param {*} message  Any message. Message must be a stringifiable JSON object.
 */
Babbler.prototype.send = function (to, message) {
  // send is overridden when running connect
  throw new Error('Cannot send: not connected');
};

/**
 * Listen for a specific event
 *
 * Providing a condition will only start the flow when condition is met,
 * this is equivalent of doing `listen().iif(condition)`
 *
 * Providing a callback function is equivalent of doing either
 * `listen(message).then(callback)` or `listen().iif(message).then(callback)`.
 *
 * @param {function | RegExp | String | *} [condition]
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Start block of a control flow.
 */
Babbler.prototype.listen = function (condition, callback) {
  var listen = new Listen();
  this.listeners.push(listen);

  var block = listen;
  if (condition) {
    block = block.iif(condition);
  }
  if (callback) {
    block = block.then(callback);
  }
  return block;
};

/**
 * Listen for a specific event, and execute the flow once.
 *
 * Providing a condition will only start the flow when condition is met,
 * this is equivalent of doing `listen().iif(condition)`
 *
 * Providing a callback function is equivalent of doing either
 * `listen(message).then(callback)` or `listen().iif(message).then(callback)`.
 *
 * @param {function | RegExp | String | *} [condition]
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Start block of a control flow.
 */
Babbler.prototype.listenOnce = function (condition, callback) {
  var listen = new Listen();
  this.listeners.push(listen);

  var me = this;
  var block = listen;

  if (condition) {
    block = block.iif(condition);
  }

  block = block.then(function (message) {
    // remove the flow from the listeners after fired once
    var index = me.listeners.indexOf(listen);
    if (index !== -1) {
      me.listeners.splice(index, 1);
    }
    return message;
  });

  if (callback) {
    block = block.then(callback);
  }

  return block;
};

/**
 * Send a message to the other peer
 * Creates a block Tell, and runs the block immediately.
 * @param {String} to       Babbler id
 * @param {Function | *} message
 * @return {Block} block    Last block in the created control flow
 */
Babbler.prototype.tell = function (to, message) {
  var me = this;
  var cid = uuid.v4(); // create an id for this conversation

  // create a new conversation
  var conversation = new Conversation({
    id: cid,
    self: this.id,
    other: to,
    context: {
      from: to
    },
    send: me.send
  });
  this.conversations[cid] = [conversation];

  var block = new Tell(message);

  // run the Tell block on the next tick, when the conversation flow is created
  setTimeout(function () {
    me._process(block, conversation)
        .then(function () {
          // cleanup the conversation
          delete me.conversations[cid];
    })
  }, 0);

  return block;
};

/**
 * Send a question, listen for a response.
 * Creates two blocks: Tell and Listen, and runs them immediately.
 * This is equivalent of doing `Babbler.tell(to, message).listen(callback)`
 * @param {String} to             Babbler id
 * @param {* | Function} message  A message or a callback returning a message.
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Last block in the created control flow
 */
Babbler.prototype.ask = function (to, message, callback) {
  return this
      .tell(to, message)
      .listen(callback);
};

/**
 * Process a flow starting with `block`, given a conversation
 * @param {Block} block
 * @param {Conversation} conversation
 * @return {Promise.<Conversation>} Resolves when the conversation is finished
 * @private
 */
Babbler.prototype._process = function (block, conversation) {
  return new Promise(function (resolve, reject) {
    /**
     * Process a block, given the conversation and a message which is chained
     * from block to block.
     * @param {Block} block
     * @param {*} [message]
     */
    function process(block, message) {
      //console.log('process', conversation.self, conversation.id, block.constructor.name, message) // TODO: cleanup

      block.execute(conversation, message)
          .then(function (next) {
            if (next.block) {
              // recursively evaluate the next block in the conversation flow
              process(next.block, next.result);
            }
            else {
              // we are done, this is the end of the conversation
              resolve(conversation);
            }
          });
    }

    // process the first block
    process(block);
  });
};

module.exports = Babbler;
