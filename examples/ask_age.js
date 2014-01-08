var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('ask age').reply(function () {
  return 25;
});

emma.listen('tell age').run(function (age, context) {
  console.log(context.from + ' is ' +  age + ' years old');
});

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age').listen(function (age, context) {
  console.log(context.from + ' is ' + age + ' years old');
});
