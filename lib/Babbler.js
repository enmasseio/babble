var uuid = require('node-uuid'),

    pubsubInterfaces = require('./pubsub'),

    FlowBuilder = require('./FlowBuilder'),

    Block = require('./block/Block'),
    Action = require('./block/Action'),
    Reply = require('./block/Reply'),
    Start = require('./block/Start');

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
      // console.log('message', me.id, message); // TODO: cleanup
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
 * @param {Block} next   An Action or Decision block
 */
// TODO: delete old function listen
Babbler.prototype.___listen = function listen (message, next) {
  if (typeof message !== 'string') {
    throw new TypeError('Parameter message must be a string');
  }

  if (!(next instanceof Block)) {
    throw new TypeError('Parameter next must be a Block');
  }

  // TODO: add support for a string as callback
  this.listeners[message] = new Start(next);
};

/**
 * Listen for a specific event
 * @param {String} message
 * @return {FlowBuilder} builder
 */
Babbler.prototype.listen = function listen (message) {
  if (typeof message !== 'string') {
    throw new TypeError('Parameter message must be a string');
  }

  // TODO: add support for a string as callback

  var listener = new Start();
  var flow = new FlowBuilder(listener);

  this.listeners[message] = listener;

  return flow;
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
 * Send a question, await a response.
 * @param {String} id             Babbler id
 * @param {String} message
 * @param {JSON} [data]           Data must be serializable
 * @return {FlowBuilder} builder
 */
Babbler.prototype.ask = function ask (id, message, data) {
  var me = this;

  var start = new Start();

  var builder = new FlowBuilder(start);
  builder.on('done', function () {
    var cid = uuid.v4(); // create an id for this conversation

    if (start.next) {
      // create a new conversation
      me.conversations[cid] = {
        id: cid,
        peer: id,
        next: start.next,
        context: {
          from: id
        }
      };
    }

    me.publish(id, {
      id: cid,
      from: me.id,
      to: id,
      message: message,
      data: data
    });
  });

  return builder;
};

/**
 * Run next block for given conversation
 * @param {Object} conversation
 * @param {*} [message]
 * @private
 */
Babbler.prototype._run = function _run (conversation, message) {
  //console.log('_run', conversation, message); // TODO: cleanup
  var block = conversation.next;
  var next = block.execute(conversation.context, message);
  var result = next.result;
  conversation.next = next.block;

  //console.log('_run next ', next); // TODO: cleanup

  if (conversation.next !== undefined) {
    // store the conversation
    this.conversations[conversation.id] = conversation;
  }
  else {
    // end of the conversation, there is no next block
    delete this.conversations[conversation.id];
  }

  if (block instanceof Reply) {
    // send a response back to the other peer
    this.publish(conversation.peer, {
      id: conversation.id,
      from: this.id,
      to: conversation.peer,
      message: result
    });
  }
  else { // Decision, Listen, Action
    if (conversation.next) {
      // immediately run the next block (with the same message)
      this._run(conversation, message);
    }
  }
};

module.exports = Babbler;
