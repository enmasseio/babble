'use strict';

// built-in messaging interfaces

/**
 * pubsub-js messaging interface
 * @returns {{connect: function, disconnect: function, send: function}}
 */
exports['pubsub-js'] = function () {
  var PubSub = require('pubsub-js');

  return {
    connect: function (params) {
      var token = PubSub.subscribe(params.id, function (id, message) {
        params.message(message);
      });

      if (typeof params.connect === 'function') {
        params.connect();
      }

      return token;
    },

    disconnect: function(token) {
      PubSub.unsubscribe(token);
    },

    send: function (id, message) {
      PubSub.publish(id, message);
    }
  }
};

/**
 * // pubnub messaging interface
 * @param {{publish_key: string, subscribe_key: string}} params
 * @returns {{connect: function, disconnect: function, send: function}}
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
    connect: function (params) {
      pubnub.subscribe({
        channel: params.id,
        message: params.message,
        connect: params.connect
      });

      return params.id;
    },

    disconnect: function (id) {
      pubnub.unsubscribe(id);
    },

    send: function (id, message) {
      pubnub.publish({
        channel: id,
        message: message
      });
    }
  }
};

// default interface
exports['default'] = exports['pubsub-js'];
