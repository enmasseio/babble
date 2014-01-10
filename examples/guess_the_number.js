var babble = require('../index');

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

(function () {
  var emma = babble.babbler('emma').subscribe();

  function decideToPlay () {
    return (Math.random() > 0.2) ? 'start': 'deny';
  }

  function decideIfCorrect (guess, context) {
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

  var start = function (response, context) {
    // choose a random value
    context.number = randomInt(MIN, MAX);

    console.log('emma: ok I have a number in mind between ' + MIN + ' and ' + MAX);
    return 'ok';
  };

  var deny = function () {
    return 'no thanks';
  };

  function higher () {
    console.log('emma: higher');
    return 'higher';
  }

  function lower () {
    console.log('emma: lower');
    return 'lower';
  }

  function right () {
    console.log('emma: right!');
    return 'right';
  }

  var check = babble.decide(decideIfCorrect);
  check.addChoice('higher', babble.reply(higher).then(check));
  check.addChoice('lower',  babble.reply(lower).then(check));
  check.addChoice('right',  babble.reply(right));

  emma.listen('lets play guess the number')
      .decide(decideToPlay, {
        start: babble.reply(start).then(check),
        deny:  babble.reply(deny)
      });

})();

/* -------------------------------------------------------------------------- */

(function () {
  var jack = babble.babbler('jack').subscribe();

  function decideToStart (response) {
    return (response == 'ok') ? 'start': 'cancel';
  }

  function decideIfCorrect (response) {
    return (response == 'right') ? 'right': 'wrong';
  }

  function start(response, context) {
    context.lower = MIN;
    context.upper = MAX;
  }

  function whine() {
    console.log('emma doesn\'t want to play guess the number :(');
  }

  function triumph (response, context) {
    console.log('jack: I found it! The correct number is: ' + context.number);
  }

  function guess (response, context) {
    if (response == 'higher') {
      context.lower = context.number + 1;
    }
    else if (response == 'lower') {
      context.upper = context.number - 1;
    }

    context.number = randomInt(context.lower, context.upper);
    console.log('jack: guessing ' + context.number + '...');
    return context.number;
  }

  var checkGuess = babble.decide(decideIfCorrect);
  checkGuess.addChoice('right', babble.run(triumph));
  checkGuess.addChoice('wrong', babble.reply(guess).then(checkGuess));

  jack.ask('emma', 'lets play guess the number')
      .decide(decideToStart, {
        start:  babble.run(start).reply(guess).then(checkGuess),
        cancel: babble.run(whine)
      });

})();

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
