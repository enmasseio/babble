var babble = require('../index');

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.listen('ask age').then(function () {
  return 25;
});

emma.listen('tell age').then(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
});

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age').then(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
});
