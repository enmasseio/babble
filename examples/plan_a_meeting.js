var babble = require('../index');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('do you have time today?')
    .decide(function (response) {
      return (Math.random() > 0.4) ? 'yes' : 'no';
    }, {
      yes: babble.reply(function () {
            return 'yes';
          })
          .decide(function (response) {
            if (response == 'can we meet at 15:00?' && Math.random() > 0.5) {
              return 'ok';
            }
            else {
              return 'no';
            }
          }, {
            ok: babble.reply(function () {
                  return 'ok';
                }),
            no: babble.reply(function () {
                  return 'no';
                })
          }),
      no: babble.reply(function () {
            return 'no';
          })
    });

jack.ask('emma', 'do you have time today?')
    .decide({
      yes: babble.reply(function () {
            return 'can we meet at 15:00?';
          })
          .decide(function (response) {
            return (response == 'ok') ? 'ok': 'notOk';
          }, {
            ok: babble.run(function () {
                  console.log('emma agreed');
                }),
            notOk: babble.run(function () {
                  console.log('emma didn\'t agree');
                })
          }),
      no: babble.run(function () {
            console.log('emma has no time');
          })
    });
