// built-in pubsub interfaces

/**
 * pubsub-js interface
 * @returns {{subscribe: subscribe, publish: publish}}
 */
exports['pubsub-js'] = function () {
  var PubSub = require('pubsub-js');

  return {
    subscribe: function (params) {
      var token = PubSub.subscribe(params.id, function (id, message) {
        params.message(message);
      });

      if (typeof params.connect === 'function') {
        params.connect();
      }

      return function () {
        PubSub.unsubscribe(token);
      };
    },
    publish: function (params) {
      PubSub.publish(params.id, params.message);
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
    // node.js
    PUBNUB = require('pubnub');
  }

  var pubnub = PUBNUB.init(params);

  return {
    subscribe: function (params) {
      pubnub.subscribe({
        channel: params.id,
        message: params.message,
        connect: params.connect
      });

      return function () {
        pubnub.unsubscribe(params.id);
      }
    },
    publish: function (params) {
      pubnub.publish({
        channel: params.id,
        message: params.message
      });
    }
  }
};

// default interface
exports['default'] = exports['pubsub-js'];
