var babble = require('../index'),
    babbler = babble.babbler,
    decide = babble.decide,
    reply = babble.reply,
    then = babble.then;

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

var emma = babbler('emma');

var checkGuess = decide(function (guess) {
  if (guess < this.number) {
    return reply(function () {
      console.log('emma: higher');
      return 'higher';
    }, checkGuess)
  }
  else if (guess > this.number) {
    return reply(function () {
      console.log('emma: lower');
      return 'lower';
    }, checkGuess)
  }
  else  {
    return reply(function () {
      console.log('emma: right!');
      return 'right';
    });
  }
});

var startGame = reply(function () {
  // choose a random value
  this.number = randomInt(MIN, MAX);

  console.log('emma: ok I have a number in mind between ' + MIN + ' and ' + MAX);
  return 'ok';
}, checkGuess);

var denyGame = then(function () {
  return 'no thanks';
});

emma.listen('lets play guess the number', decide(function () {
  if (Math.random() > 0.1) {
    return startGame;
  }
  else {
    return denyGame;
  }
}));

/* -------------------------------------------------------------------------- */

var jack = babbler('jack');

var nextGuess = decide(function (response) {
  if (response == 'right') {
    return then(function () {
      console.log('jack: I found it! The correct number is: ' + this.number);
    });
  }
  else {
    return reply(function (response) {
      if (response == 'higher') {
        this.lower = this.number + 1;
      }
      else if (response == 'lower') {
        this.upper = this.number - 1;
      }

      this.number = randomInt(this.lower, this.upper);
      console.log('jack: guessing ' + this.number + '...');
      return this.number;
    }, nextGuess);
  }
});

var initialize = reply(function () {
  this.lower = MIN;
  this.upper = MAX;

  this.number = randomInt(this.lower, this.upper);
  console.log('jack: guessing ' + this.number + '...');
  return this.number;
}, nextGuess);

var whine = then(function () {
  console.log('emma doesn\'t want to play guess the number :(');
});

jack.ask('emma', 'lets play guess the number', decide(function (response) {
  if (response == 'ok') {
    return initialize;
  }
  else {
    return whine;
  }
}));


function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
