var uuid = require('node-uuid'),

    pubsubInterfaces = require('./pubsub'),
    FlowNode = require('./flow/FlowNode'),
    ReplyNode = require('./flow/ReplyNode'),
    TriggerNode = require('./flow/TriggerNode');

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
  this.triggers = {};
  this.conversations = {};
}

/**
 * Subscribe to a pubsub system
 * @param {Object} [pubsub]   A pubsub interface. Must have the following
 *                            functions:
 *                            - subscribe(id: string, callback: function) : function
 *                              must return a function which, when invoked,
 *                              unsubscribes again.
 *                            - publish(id: string, message: *)
 *                            A number of interfaces is provided under
 *                            babble.pubsub. Default interface is
 *                            babble.pubsub['default']
 * @return {Babbler} self
 */
Babbler.prototype.subscribe = function subscribe (pubsub) {
  if (!pubsub) pubsub = pubsubInterfaces['default'];

  if (typeof pubsub.subscribe !== 'function') {
    throw new Error('pubsub must contain a function ' +
        'subscribe(id: string, callback: function) : function');
  }

  if (typeof pubsub.publish !== 'function') {
    throw new Error('pubsub must contain a function ' +
        'publish(id: string, message: *)');
  }

  var me = this;
  var unsubscribe = pubsub.subscribe(this.id, function (id, message) {
    var conversation, trigger;
    //console.log('message', me.id, message); // TODO: cleanup
    // check the open conversations
    conversation = me.conversations[message.id];
    if (conversation) {
      me._run(conversation, message.message);
    }
    else {
      // check the triggers to start a new conversation
      trigger = me.triggers[message.message];
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
 * @param {FlowNode} next   A flow node: action or decision
 */
Babbler.prototype.listen = function listen (message, next) {
  if (typeof message !== 'string') {
    throw new TypeError('Parameter message must be a string');
  }

  if (!(next instanceof FlowNode)) {
    throw new TypeError('Parameter next must be a FlowNode');
  }

  // TODO: add support for a string as callback
  this.triggers[message] = new TriggerNode(next);
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
 * Send a notification
 * @param {String} id       Babbler id
 * @param {String} message
 * @param {JSON} [data]     Data must be serializable
 * @param {FlowNode} next   A flow node: action or decision
 */
Babbler.prototype.ask = function ask (id, message, data, next) {
  var cid = uuid.v4(); // create an id for this conversation

  // handle optional parameter data
  if (arguments.length < 4) {
    next = data;
    data = undefined;
  }

  // create a new conversation
  this.conversations[cid] = {
    id: cid,
    peer: id,
    next: next,
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
};

/**
 * Run next flow node for given conversation
 * @param {Object} conversation
 * @param {*} [message]
 * @private
 */
Babbler.prototype._run = function _run (conversation, message) {
  //console.log('_run', conversation, message); // TODO: cleanup
  var node = conversation.next;
  var next = node.run(conversation.context, message);
  var result = next.result;
  conversation.next = next.node;

  //console.log('_run next ', next); // TODO: cleanup

  if (conversation.next !== undefined) {
    // store the conversation
    this.conversations[conversation.id] = conversation;
  }
  else {
    // end of the conversation, there is no next node
    delete this.conversations[conversation.id];
  }

  if (node instanceof ReplyNode) {
    // send a response back to the other peer
    this.publish(conversation.peer, {
      id: conversation.id,
      from: this.id,
      to: conversation.peer,
      message: result
    });
  }
  else { // DecisionNode, TriggerNode, ActionNode
    if (conversation.next) {
      // immediately run the next node (with the same message)
      this._run(conversation, message);
    }
  }
};

module.exports = Babbler;
