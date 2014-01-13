var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

function decideIfAvailable () {
  return (Math.random() > 0.4) ? 'yes' : 'no';
}

function decideToAgree (response) {
  if (response == 'can we meet at 15:00?' && Math.random() > 0.5) {
    return 'ok';
  }
  else {
    return 'no';
  }
}

function yes() {
  return 'yes';
}

function ok () {
  return 'ok';
}

function no () {
  return 'no';
}

emma.listen('do you have time today?')
    .decide(decideIfAvailable, {
      yes: babble.tell(yes)
              .listen()
              .decide(decideToAgree, {
                ok: babble.tell(ok),
                no: babble.tell(no)
              }),
      no: babble.tell(no)
    });

function askToMeet () {
  return 'can we meet at 15:00?';
}

function noTime () {
  console.log('emma has no time');
}

function agreesToMeet (response) {
  return (response == 'ok') ? 'ok': 'no';
}

function agreement () {
  console.log('emma agreed');
}

function noAgreement () {
  console.log('emma didn\'t agree');
}

jack.ask('emma', 'do you have time today?')
    .decide({
      yes: babble.tell(askToMeet)
              .listen()
              .decide(agreesToMeet, {
                ok: babble.run(agreement),
                no: babble.run(noAgreement)
              }),
      no: babble.run(noTime)
    });
