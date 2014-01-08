var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run,
    decide = babble.decide;

var emma = babbler('emma').subscribe(),
    jack = babbler('jack').subscribe();

emma.listen('do you have time today?')
    .decide(function (response) {
      if (Math.random() > 0.4) {
        return 'yes';
      }
      else {
        return 'no';
      }
    }, {
      yes: babble.reply(function () {
        return 'yes';
      }, decide(function (response) {
        if (response == 'can we meet at 15:00?' && Math.random() > 0.5) {
          return reply(function () {
            return 'ok';
          });
        }
        else {
          return reply(function () {
            return 'no';
          })
        }
      })),
      no: babble.reply(function () {
        return 'no';
      })
    });

jack.ask('emma', 'do you have time today?')
    .listen()
    .decide({
      yes: reply(function () {
        return 'can we meet at 15:00?';
      }, decide(function (response) {
        if (response == 'ok') {
          return run(function () {
            console.log('emma agreed');
          });
        }
        else {
          return run(function () {
            console.log('emma didn\'t agree');
          });
        }
      })),
      no: babble.run(function () {
        console.log('emma has no time');
      })
    });
