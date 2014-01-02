var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run;

var emma = babbler('emma').subscribe(),
    jack = babbler('jack').subscribe();

emma.listen('ask age', reply(function () {
  return 25;
}));

emma.listen('tell age', run(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', run(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
