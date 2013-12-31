var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run;

// initialize pubnub
var pubnub = babble.pubsub.pubnub({
  publish_key: 'demo',
  subscribe_key: 'demo'
});

var emma = babbler('emma').subscribe(pubnub);
var jack = babbler('jack').subscribe(pubnub);

// TODO: implement and use connected callback of subscription
setTimeout(function () {

  emma.listen('ask age', reply(function (response) {
    return 25;
  }));

  emma.listen('tell age', run (function (age) {
    console.log(this.from + ' is ' +  age + ' years old');
  }));


  jack.tell('emma', 'tell age', 27);

  jack.ask('emma', 'ask age', run (function (age) {
    console.log(this.from + ' is ' + age + ' years old');
  }));

}, 2000);
