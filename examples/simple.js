var babble = require('../index'),
    babbler = babble.babbler,
    act = babble.act,
    reply = babble.reply;

var emma = babbler('emma'),
    jack = babbler('jack');

emma.listen('ask age', reply(function () {
  return 25;
}));

emma.listen('tell age', act(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', reply(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
