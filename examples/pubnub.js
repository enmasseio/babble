var babble = require('../index'),
    async = require('async');

// initialize pubnub
var pubnub = babble.pubsub.pubnub({
  publish_key: 'demo',    // REPLACE THIS WITH YOUR PUBNUB PUBLISH KEY
  subscribe_key: 'demo'   // REPLACE THIS WITH YOUR PUBNUB SUBSCRIBE KEY
});

// subscribing to pubsub works asynchronous
async.parallel({
  emma: function (cb) {
    var emma = babble.babbler('emma').subscribe(pubnub, function () {
      cb(null, emma);
    });
  },

  jack: function (cb) {
    var jack = babble.babbler('jack').subscribe(pubnub, function () {
      cb(null, jack);
    });
  }
},
function (err, babblers) {
  babblers.emma.listen('hi')
      .listen(printMessage)
      .decide(function (message, context) {
        return (message.indexOf('age') != -1) ? 'age' : 'name';
      }, {
        'name': babble.tell('hi, my name is emma'),
        'age':  babble.tell('hi, my age is 27')
      });

  babblers.jack.tell('emma', 'hi')
      .tell(function (message, context) {
        if (Math.random() > 0.5) {
          return 'my name is jack'
        } else {
          return 'my age is 25';
        }
      })
      .listen(printMessage);
});

function printMessage (message, context) {
  console.log(context.from + ': ' + message);
  return message;
}
