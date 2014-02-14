var babble = require('../index');

var emma = babble.babbler('emma').connect(),
    jack = babble.babbler('jack').connect();

emma.listen('ask age')
    .tell(function () {
      return 25;
    });

jack.ask('emma', 'ask age', function (age, context) {
  console.log(context.from + ' is ' + age + ' years old');
});
