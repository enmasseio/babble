var PubSub = require('pubsub-js'),
    uuid = require('node-uuid');

// TODO: implement PubNub support

/**
 * Babbler
 * @param {String} id
 * @constructor
 */
function Babbler (id) {
  if (!(this instanceof Babbler)) {
    throw new SyntaxError(
        'Constructor must be called with the new operator');
  }

  if (!id) {
    throw new Error('id required');
  }

  this.id = id;

  this.listeners = {};
  this.conversations = {};

  // TODO: be able to unsubscribe a babbler
  // TODO: use an instantiated pubsub solution
  var me = this;
  PubSub.subscribe(this.id, function (id, conversation) {
    var callback;

    switch (conversation.type) {
      case 'ask':
        callback = me.listeners[conversation.message];
        if (callback) {
          me._reply(conversation, callback);
        }
        break;

      case 'tell':
        callback = me.listeners[conversation.message];
        if (callback) {
          var context = {
            from: conversation.from
          };
          callback.call(context, conversation.data || null);
        }
        break;

      case 'reply':
        callback = me.conversations[conversation.id];
        if (callback) {
          delete me.conversations[conversation.id];

          me._reply(conversation, callback);
        }
        break;

      default:
        // TODO: return error
    }
  });
}

/**
 * Listen for a specific event
 * @param {String} message
 * @param {Function} callback   Invoked as callback(msg, data)
 * @return {Babbler} self
 */
Babbler.prototype.listen = function listen (message, callback) {
  // TODO: add support for a string as callback

  this.listeners[message] = callback;

  return this;
};

/**
 * Send a notification
 * @param {String} id       Babbler id
 * @param {String} message
 * @param {JSON} [data]     Data must be serializable
 * @return {Babbler} self
 */
Babbler.prototype.tell = function tell (id, message, data) {
  PubSub.publish(id, {
    type: 'tell',
    from: this.id,
    to: id,
    message: message,
    data: data
  });

  return this;
};

/**
 * Send a notification
 * @param {String} id       Babbler id
 * @param {String} message
 * @param {JSON} [data]     Data must be serializable
 * @param {Function} callback
 * @return {Babbler} self
 */
Babbler.prototype.ask = function ask (id, message, data, callback) {
  var cid = uuid.v4(); // create an id for this conversation

  // handle optional parameter data
  if (arguments.length < 4) {
    callback = data;
    data = null;
  }

  this.conversations[cid] = callback;

  PubSub.publish(id, {
    type: 'ask',
    id: cid,
    from: this.id,
    to: id,
    message: message,
    data: data
  });

  return this;
};

/**
 * Handle a reply
 * @param {{from:String, data:*, id:String}} conversation
 * @param {Function} callback
 * @private
 */
Babbler.prototype._reply = function _reply (conversation, callback) {
  var me = this;
  var context = {
    from: conversation.from,
    reply: function (data, callback) {
      if (callback) {
        me.conversations[conversation.id] = callback;
      }

      PubSub.publish(conversation.from, {
        type: 'reply',
        id: conversation.id,
        from: me.id,
        to: conversation.from,
        data: data
      });
    }
  };

  callback.call(context, conversation.data);
};


module.exports = Babbler;