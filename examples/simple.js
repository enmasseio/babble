var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    then = babble.then;


var emma = babbler('emma');

emma.listen('ask age', reply(function () {
  return 25;
}));

emma.listen('tell age', then (function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));


var jack = babbler('jack');

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', then (function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
