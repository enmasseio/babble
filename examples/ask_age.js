var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('ask age', babble.reply(function () {
  return 25;
}));

emma.listen('tell age', babble.run(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', babble.run(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
