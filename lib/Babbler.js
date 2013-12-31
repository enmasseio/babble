var PubSub = require('pubsub-js'),
    uuid = require('node-uuid'),

    FlowNode = require('./flow/FlowNode'),
    TriggerNode = require('./flow/TriggerNode');

// TODO: implement PubNub support

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

  // TODO: use an instantiated pubsub solution
  var me = this;
  this.token = PubSub.subscribe(this.id, function (id, message) {
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
}

/**
 * Stop listening for messages
 */
Babbler.prototype.destroy = function destroy () {
  if (this.token) {
    PubSub.unsubscribe(this.token);
    this.token = null;
  }
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
  PubSub.publish(id, {
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

  PubSub.publish(id, {
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
  var next = conversation.next.run(conversation.context, message);
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

  if (result !== undefined) {
    // send a response back to the other peer
    PubSub.publish(conversation.peer, {
      id: conversation.id,
      from: this.id,
      to: conversation.peer,
      message: result
    });
  }
  else {
    if (conversation.next) {
      // immediately run the next node (with the same message)
      this._run(conversation, message);
    }
  }
};

module.exports = Babbler;
