var PubSub = require('pubsub-js');

// built-in pubsub interfaces

// pubsub-js interface
exports['pubsub-js'] = {
  subscribe: function (id, callback) {
    var token = PubSub.subscribe(id, callback);

    return function () {
      PubSub.unsubscribe(token);
    }
  },
  publish: function (id, message) {
    PubSub.publish(id, message);
  }
};

// default interface
exports['default'] = exports['pubsub-js'];
