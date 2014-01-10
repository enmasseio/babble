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
      yes: babble.reply(yes)
              .decide(decideToAgree, {
                ok: babble.reply(ok),
                no: babble.reply(no)
              }),
      no: babble.reply(no)
    });

function askToMeet () {
  return 'can we meet at 15:00?';
}

function noTime () {
  console.log('emma has no time');
}

function agreesToMeet (response) {
  return (response == 'ok') ? 'ok': 'notOk';
}

function agreement () {
  console.log('emma agreed');
}

function noAgreement () {
  console.log('emma didn\'t agree');
}

jack.ask('emma', 'do you have time today?')
    .decide({
      yes: babble.reply(askToMeet)
              .decide(agreesToMeet, {
                ok: babble.run(agreement),
                notOk: babble.run(noAgreement)
              }),
      no: babble.run(noTime)
    });
