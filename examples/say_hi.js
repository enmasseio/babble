var babble = require('../index');

var emma = babble.babbler('emma');
var jack = babble.babbler('jack');

emma.listen('hi')
    .listen(function (message, context) {
      console.log(context.from + ': ' + message);
      return message;
    })
    .decide(function (message, context) {
      return (message.indexOf('age') != -1) ? 'age' : 'name';
    }, {
      'name': babble.tell('hi, my name is emma'),
      'age':  babble.tell('hi, my age is 27')
    });

jack.tell('emma', 'hi')
    .tell(function (message, context) {
      if (Math.random() > 0.5) {
        return 'my name is jack'
      } else {
        return 'my age is 25';
      }
    })
    .listen(function (message, context) {
      console.log(context.from + ': ' + message);
    });
