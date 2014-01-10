var uuid = require('node-uuid'),

    pubsubInterfaces = require('./pubsub'),

    Block = require('./block/Block'),
    Action = require('./block/Action'),
    Reply = require('./block/Reply'),
    Listen = require('./block/Listen');

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
}

/**
 * Subscribe to a pubsub system
 * @param {Object} [pubsub]     A pubsub interface. Must have the following
 *                              functions:
 *                              - subscribe(params: {id: string,
 *                                message: function, connect: function}) : function
 *                                must return a function which, when invoked,
 *                                unsubscribes again. parameter connect is optional.
 *                              - publish(id: string, message: *)
 *                                publish a message
 *                              A number of interfaces is provided under
 *                              babble.pubsub. Default interface is
 *                              babble.pubsub['default']
 * @param {Function} [callback] Called when subscription is completed. Called
 *                              without parameters
 * @return {Babbler} self
 */
Babbler.prototype.subscribe = function subscribe (pubsub, callback) {
  if (typeof pubsub === 'function') {
    // function is called as subscribe(callback)
    callback = pubsub;
    pubsub = null;
  }

  if (!pubsub) {
    pubsub = pubsubInterfaces['default']();
  }

  if (typeof pubsub.subscribe !== 'function') {
    throw new Error('pubsub must contain a function ' +
        'subscribe(params: {id: string, callback: function}) : function');
  }

  if (typeof pubsub.publish !== 'function') {
    throw new Error('pubsub must contain a function ' +
        'publish(params: {id: string, message: *})');
  }

  var me = this;
  var unsubscribe = pubsub.subscribe({
    id: this.id,
    message: function (message) {
      var conversation, trigger;
      //console.log('message', me.id, message); // TODO: cleanup
      // check the open conversations
      conversation = me.conversations[message.id];
      if (conversation) {
        me._run(conversation, message.message);
      }
      else {
        // check the listeners to start a new conversation
        trigger = me.listeners[message.message];
        if (trigger) {
          //console.log('message create a new conversation', trigger, trigger.callback); // TODO: cleanup
          // create a new conversation
          conversation = {
            id: message.id,
            peer: message.from,
            next: trigger,
            context: {
              from: message.from
            }
          };

          me._run(conversation, message.data);
        }
      }
    },
    connect: callback
  });

  if (typeof unsubscribe !== 'function') {
    throw new Error('pubsub.subscribe must return a function to unsubscribe');
  }

  // link functions to unsubscribe and publish
  this.unsubscribe = unsubscribe;
  this.publish = pubsub.publish;

  return this;
};

/**
 * Unsubscribe from the pubsub system
 */
Babbler.prototype.unsubscribe = function unsubscribe () {
  // TODO: unsubscribe must also have a callback
  // unsubscribe is overridden when running subscribe
  throw new Error('Cannot unsubscribe: not subscribed');
};

/**
 * Publish a message
 * @param {String} id
 * @param {*} message
 */
Babbler.prototype.publish = function publish (id, message) {
  // publish is overridden when running subscribe
  throw new Error('Cannot publish: not subscribed');
};

/**
 * Listen for a specific event
 * @param {String} message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation.
 * @return {Block} block        Start block of a control flow.
 */
Babbler.prototype.listen = function listen (message, callback) {
  if (typeof message !== 'string') {
    throw new TypeError('Parameter message must be a string');
  }

  // TODO: add support for a string as callback

  var listen = new Listen(callback);

  this.listeners[message] = listen;

  return listen;
};

/**
 * Send a notification
 * @param {String} id       Babbler id
 * @param {String} message
 * @param {JSON} [data]     Data must be serializable
 */
Babbler.prototype.tell = function tell (id, message, data) {
  this.publish(id, {
    from: this.id,
    to: id,
    message: message,
    data: data
  });
};

/**
 * Send a question, listen for a response
 * @param {String} id             Babbler id
 * @param {String} message
 * @param {JSON} [data]           Data must be serializable
 * @param {Function} [callback]   Callback called
 * @return {Block} block          Start block for the control flow
 */
Babbler.prototype.ask = function ask (id, message, data, callback) {
  var cid = uuid.v4(); // create an id for this conversation

  if (typeof data === 'function') {
    callback = data;
    data = undefined;
  }

  var block = new Listen(callback);

  // create a new conversation
  this.conversations[cid] = {
    id: cid,
    peer: id,
    next: block,
    context: {
      from: id
    }
  };

  this.publish(id, {
    id: cid,
    from: this.id,
    to: id,
    message: message,
    data: data
  });

  return block;
};

/**
 * Run next block for given conversation
 * @param {Object} conversation
 * @param {*} [message]
 * @private
 */
Babbler.prototype._run = function _run (conversation, message) {
  //console.log('_run', conversation, message); // TODO: cleanup

  // remove the conversation from the queue
  delete this.conversations[conversation.id];

  var block = conversation.next;
  do {
    //console.log('execute', block, message); // TODO: cleanup
    var next = block.execute(message, conversation.context);

    if (block instanceof Reply) {
      // send a response back to the other peer
      this.publish(conversation.peer, {
        id: conversation.id,
        from: this.id,
        to: conversation.peer,
        message: next.result
      });
    }

    message = next.result;
    block   = next.block;
    //console.log('message', message); // TODO: cleanup

    if (block instanceof Listen) {
      // wait for a next incoming message
      conversation.next = block;
      this.conversations[conversation.id] = conversation;
    }
  }
  while (block && !(block instanceof Listen));
};

module.exports = Babbler;
