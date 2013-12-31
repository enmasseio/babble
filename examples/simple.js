var babble = require('../index'),
    babbler = babble.babbler,
    act = babble.act;


var emma = babbler('emma');

emma.listen('ask age', act(function () {
  return 25;
}));

emma.listen('tell age', act(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));


var jack = babbler('jack');

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', act(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
