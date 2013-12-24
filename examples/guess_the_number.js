var babble = require('../index');

var MIN = 0,
    MAX = 50;

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.listen('lets play guess the number', function () {
  // choose a random value
  var number = randomInt(MIN, MAX);

  console.log('emma: ok I have a number in mind between ' + MIN + ' and ' + MAX);
  this.reply('ok', function test (guess) {
    var answer = (guess < number) ? 'higher' :
        (guess > number) ? 'lower' : 'right';
    console.log('emma: ' + answer);
    this.reply(answer, test);
  });
});

jack.ask('emma', 'lets play guess the number', function (answer) {
  if (answer == 'ok') {
    var lower = MIN;
    var upper = MAX;
    var number = randomInt(lower, upper);

    console.log('jack: guessing ' + number + '...');
    this.reply(number, function guess (answer) {
      if (answer == 'higher') {
        lower = number + 1;

        number = randomInt(lower, upper);
        console.log('jack: guessing ' + number + '...');
        this.reply(number, guess);
      }
      else if (answer == 'lower') {
        upper = number - 1;

        number = randomInt(lower, upper);
        console.log('jack: guessing ' + number + '...');
        this.reply(number, guess);
      }
      else if (answer == 'right') {
        console.log('jack: I found it! The correct number is: ' + number);
      }
    });
  }
});

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
