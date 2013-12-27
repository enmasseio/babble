var babble = require('../index');

var MIN = 0,
    MAX = 50;

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.onMessage('lets play guess the number', function () {
  // choose a random value
  this.number = randomInt(MIN, MAX);

  console.log('emma: ok I have a number in mind between ' + MIN + ' and ' + MAX);
  return 'ok';
}).onMessage({repeat: true}, function (guess) {
  var answer = (guess < this.number) ? 'higher' :
      (guess > this.number) ? 'lower' : 'right';
  console.log('emma: ' + answer);
  return answer;
});

jack.ask('emma', 'lets play guess the number').onMessage(function (answer) {
  if (answer == 'ok') {
    this.lower = MIN;
    this.upper = MAX;
    this.number = randomInt(lower, upper);

    console.log('jack: guessing ' + this.number + '...');
    return this.number;
  }
  // TODO: how to do a conditional onMessage?
}).onMessage({repeat: true}, function (answer) {
  if (answer == 'higher') {
    this.lower = this.number + 1;

    this.number = randomInt(lower, upper);
    console.log('jack: guessing ' + this.number + '...');
    return this.number;
  }
  else if (answer == 'lower') {
    this.upper = this.number - 1;

    this.number = randomInt(lower, upper);
    console.log('jack: guessing ' + this.number + '...');
    return this.number;
  }
  else if (answer == 'right') {
    console.log('jack: I found it! The correct number is: ' + this.number);
  }
});

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
