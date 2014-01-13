var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

function printMessage (message, context) {
  console.log(context.from + ': ' + message);
}

emma.listen('hi')
    .listen()
    .decide(function (message, context) {
      printMessage(message, context);
      return (message.indexOf('age') != -1) ? 'age' : 'name';
    }, {
      'name': babble.tell('hi, my name is emma'),
      'age':  babble.tell('hi, my age is 27')
    });

jack.tell('emma', 'hi')
    .tell('my name is jack')
    .listen(printMessage);

jack.tell('emma', 'hi')
    .tell('my age is 25')
    .listen()
    .run(printMessage);
