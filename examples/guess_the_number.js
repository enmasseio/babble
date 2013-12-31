var babble = require('../index'),
    babbler = babble.babbler,
    decide = babble.decide,
    reply = babble.reply,
    run = babble.run;

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

var denyGame = reply(function () {
  return 'no thanks';
});

emma.listen('lets play guess the number', decide(function () {
  if (Math.random() > 0.2) {
    return startGame;
  }
  else {
    return denyGame;
  }
}));

/* -------------------------------------------------------------------------- */

var jack = babbler('jack');

var triumph = function () {
  console.log('jack: I found it! The correct number is: ' + this.number);
};

var guess = function (response) {
  if (response == 'higher') {
    this.lower = this.number + 1;
  }
  else if (response == 'lower') {
    this.upper = this.number - 1;
  }

  this.number = randomInt(this.lower, this.upper);
  console.log('jack: guessing ' + this.number + '...');
  return this.number;
};

var initialize = function () {
  this.lower = MIN;
  this.upper = MAX;

  this.number = randomInt(this.lower, this.upper);
  console.log('jack: guessing ' + this.number + '...');
  return this.number;
};

var whine = function () {
  console.log('emma doesn\'t want to play guess the number :(');
};

var validateGuess = decide(function (response) {
  if (response == 'right') {
    return run(triumph);
  }
  else {
    return reply(guess, validateGuess);
  }
});

jack.ask('emma', 'lets play guess the number', decide(function (response) {
  if (response == 'ok') {
    return reply(initialize, validateGuess);
  }
  else {
    return run(whine);
  }
}));


function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
