var babble = require('../index');
var Promise = require('es6-promise').Promise;

// initialize pubnub messaging
var pubnub = babble.messagebus.pubnub({
  publish_key: 'demo',    // REPLACE THIS WITH YOUR PUBNUB PUBLISH KEY
  subscribe_key: 'demo'   // REPLACE THIS WITH YOUR PUBNUB SUBSCRIBE KEY
});

var emma = babble.babbler('emma');
var jack = babble.babbler('jack');

Promise.all([emma.connect(pubnub), jack.connect(pubnub)])
    .then(function () {
      emma.listen('hi')
          .listen(printMessage)
          .decide(function (message, context) {
            return (message.indexOf('age') != -1) ? 'age' : 'name';
          }, {
            'name': babble.tell('hi, my name is emma'),
            'age':  babble.tell('hi, my age is 27')
          });

      jack.tell('emma', 'hi')
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
