// built-in pubsub interfaces

/**
 * pubsub-js interface
 * @returns {{subscribe: subscribe, publish: publish}}
 */
exports['pubsub-js'] = function () {
  var PubSub = require('pubsub-js');

  return {
    subscribe: function (id, callback) {
      var token = PubSub.subscribe(id, function (id, message) {
        callback(message);
      });

      return function () {
        PubSub.unsubscribe(token);
      }
    },
    publish: function (id, message) {
      PubSub.publish(id, message);
    }
  }
};

/**
 * // pubsub-js interface
 * @param {{publish_key: string, subscribe_key: string}} params
 * @returns {{subscribe: subscribe, publish: publish}}
 */
exports['pubnub'] = function (params) {
  var PUBNUB;

  if (typeof window !== 'undefined') {
    // browser
    if (typeof window['PUBNUB'] === 'undefined') {
      throw new Error('Please load pubnub first in the browser');
    }
    PUBNUB = window['PUBNUB'];
  }
  else {
    PUBNUB = require('pubnub');
  }

  var pubnub = PUBNUB.init(params);

  return {
    subscribe: function (id, callback) {
      pubnub.subscribe({
        channel: id,
        message: callback,
        connect: function () {
          // TODO: use connect callback
        }
      });

      return function () {
        pubnub.unsubscribe(id);
      }
    },
    publish: function (id, message) {
      pubnub.publish({
        channel: id,
        message: message
      });
    }
  }
};

// default interface
exports['default'] = exports['pubsub-js'];
