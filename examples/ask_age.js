var babble = require('../index');

var emma = babble.babbler('emma');
var jack = babble.babbler('jack');

emma.listen('what is your age?')
    .tell(function () {
      return 25;
    });

jack.ask('emma', 'what is your age?')
    .then(function (age, context) {
      console.log(context.from + ' is ' + age + ' years old');
    });
