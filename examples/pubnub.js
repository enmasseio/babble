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
  babblers.emma.listen('ask age',
      babble.reply(function (response) {
        return 25;
      })
      .done()
  );

  babblers.emma.listen('tell age',
      babble.run (function (age, context) {
        console.log(context.from + ' is ' +  age + ' years old');
      })
      .done()
  );

  babblers.jack.tell('emma', 'tell age', 27);

  babblers.jack.ask('emma', 'ask age',
      babble.run (function (age, context) {
        console.log(context.from + ' is ' + age + ' years old');
      })
      .done()
  );
});
