var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('ask age')
    .tell(function () {
      return 25;
    });

emma.listen('my age is')
    .listen(function (age, context) {
      console.log(context.from + ' is ' +  age + ' years old');
    });

jack.tell('emma', 'my age is').tell(27);

jack.ask('emma', 'ask age')
    .run(function (age, context) {
      console.log(context.from + ' is ' + age + ' years old');
    });
