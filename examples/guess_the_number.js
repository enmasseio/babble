var babble = require('../index'),
    babbler = babble.babbler,
    decide = babble.decide,
    reply = babble.reply,
    run = babble.run;

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

var emma = babbler('emma').subscribe();

var checkGuess = decide(function (guess, context) {
  if (guess < context.number) {
    return reply(function () {
      console.log('emma: higher');
      return 'higher';
    }, checkGuess)
  }
  else if (guess > context.number) {
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

var startGame = reply(function (response, context) {
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

var jack = babbler('jack').subscribe();

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
