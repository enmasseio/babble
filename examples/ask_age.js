var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('ask age',
    babble.reply(function () {
      return 25;
    })
    .done()
);

emma.listen('tell age',
    babble.run(function (age, context) {
      console.log(context.from + ' is ' +  age + ' years old');
    })
    .done()
);

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age',
    babble.run(function (age, context) {
      console.log(context.from + ' is ' + age + ' years old');
    })
    .done()
);
