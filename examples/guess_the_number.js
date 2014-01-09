var babble = require('../index');

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

var emma = babble.babbler('emma').subscribe();

var startGame = function (response, context) {
  // choose a random value
  context.number = randomInt(MIN, MAX);

  console.log('emma: ok I have a number in mind between ' + MIN + ' and ' + MAX);
  return 'ok';
};

var denyGame = function () {
  return 'no thanks';
};

function check (guess, context) {
  if (guess < context.number) {
    return 'higher';
  }
  else if (guess > context.number) {
    return 'lower';
  }
  else  {
    return 'right';
  }
}

var options = {};
var validateGuess = babble.decide(check, options).done();
options.higher = babble.reply(function () {
      console.log('emma: higher');
      return 'higher';
    })
    .then(validateGuess)
    .done();

options.lower = babble.reply(function () {
      console.log('emma: lower');
      return 'lower';
    })
    .then(validateGuess)
    .done();

options.right = babble.reply(function () {
      console.log('emma: right!');
      return 'right';
    })
    .done();

emma.listen('lets play guess the number',
    babble.decide(function () {
      return (Math.random() > 0.2) ? 'start': 'deny';
    }, {
      start: babble.reply(startGame)
          .then(validateGuess)
          .done(),
      deny: babble.reply(denyGame)
          .done()
    })
    .done()
);

/* -------------------------------------------------------------------------- */

var jack = babble.babbler('jack').subscribe();

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

var triumph = function (response, context) {
  console.log('jack: I found it! The correct number is: ' + context.number);
};

var guessNext = function (response, context) {
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

var guessChoices = {};
var checkGuess = babble.decide(function (response) {
  return (response == 'right') ? 'right': 'wrong';
}, guessChoices).done();
guessChoices.right = babble.run(triumph).done();
guessChoices.wrong = babble.reply(guessNext).then(checkGuess).done();

jack.ask('emma', 'lets play guess the number',
    babble.decide(function (response) {
      return (response == 'ok') ? 'ok': 'notOk';
      }, {
      ok: babble.reply(initialize)
          .then(checkGuess)
          .done(),
      notOk: babble.run(whine).done()
    })
    .done()
);


function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
