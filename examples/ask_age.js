var babble = require('../index');

var emma = babble.babbler('emma');
var jack = babble.babbler('jack');

// listen for messages containing either 'age' or 'how old'
emma.listen(/age|how old/)
    .tell(function () {
      return 25;
    });

jack.ask('emma', 'what is your age?')
    .then(function (age, context) {
      console.log(context.from + ' is ' + age + ' years old');
    });
