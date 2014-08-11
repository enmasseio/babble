'use strict';

var Promise = require('es6-promise').Promise;

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

      if (typeof params.callback === 'function') {
        params.callback();
      }

      return token;
    },

    disconnect: function(token) {
      PubSub.unsubscribe(token);
    },

    send: function (to, message) {
      PubSub.publish(to, message);
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
        connect: params.callback
      });

      return params.id;
    },

    disconnect: function (id) {
      pubnub.unsubscribe(id);
    },

    send: function (to, message) {
      return new Promise(function (resolve, reject) {
        pubnub.publish({
          channel: to,
          message: message,
          callback: resolve
        });
      })
    }
  }
};

// default interface
exports['default'] = exports['pubsub-js'];
