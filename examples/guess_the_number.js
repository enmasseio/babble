var babble = require('../index');

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

var emma = babble.babbler('emma').subscribe();

var checkGuess = babble.decide(function (guess, context) {
  if (guess < context.number) {
    return 'higher';
  }
  else if (guess > context.number) {
    return 'lower';
  }
  else  {
    return 'right';
  }
}, {
  higher: babble.reply(function () {
        console.log('emma: higher');
        return 'higher';
      })
      .reply(checkGuess), // TODO: this doesn't work
  lower: babble.reply(function () {
        console.log('emma: lower');
        return 'lower';
      })
      .reply(checkGuess), // TODO: this doesn't work
  right: babble.reply(function () {
        console.log('emma: right!');
        return 'right';
      })
});

var startGame = babble.reply(function (response, context) {
  // choose a random value
  context.number = randomInt(MIN, MAX);

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

var jack = babble.babbler('jack').subscribe();

var triumph = function (response, context) {
  console.log('jack: I found it! The correct number is: ' + context.number);
};

var guess = function (response, context) {
  if (response == 'higher') {
    context.lower = context.number + 1;
  }
  else if (response == 'lower') {
    context.upper = context.number - 1;
  }

  context.number = randomInt(context.lower, context.upper);
  console.log('jack: guessing ' + context.number + '...');
  return context.number;
};

var initialize = function (response, context) {
  context.lower = MIN;
  context.upper = MAX;

  context.number = randomInt(context.lower, context.upper);
  console.log('jack: guessing ' + context.number + '...');
  return context.number;
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
