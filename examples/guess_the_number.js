var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    decide = babble.decide,
    act = babble.act;

var MIN = 0,
    MAX = 50;

/* -------------------------------------------------------------------------- */

var emma = babbler('emma');

var checkGuess = reply(function (guess) {
  var answer = (guess < this.number) ? 'higher' :
      (guess > this.number) ? 'lower' : 'right';
  console.log('emma: ' + answer);
  return answer;
}, decide(function (guess) {
  if (guess != this.number) {
    return checkGuess;
  }
}));

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
  if (Math.random() > 0.5) {
    return startGame;
  }
  else {
    return denyGame;
  }
}));

/* -------------------------------------------------------------------------- */

var jack = babbler('jack');

var triumph = act(function () {
  console.log('jack: I found it! The correct number is: ' + this.number);
});

var nextGuess = reply(function (response) {
  if (response == 'higher') {
    this.lower = this.number + 1;
  }
  else if (response == 'lower') {
    this.upper = this.number - 1;
  }

  this.number = randomInt(this.lower, this.upper);
  console.log('jack: guessing ' + this.number + '...');
  return this.number;
}, decide(function (response) {
  if (response == 'right') {
    return triumph;
  }
  else {
    return nextGuess;
  }
}));

var initialize = act(function () {
  this.lower = MIN;
  this.upper = MAX;
}, nextGuess);


jack.ask('emma', 'lets play guess the number', decide(function (response) {
  if (response == 'ok') {
    return initialize;
  }
}));


function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
