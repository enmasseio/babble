# Babble

Dynamic communication flows between message based actors.


## Usage

Install babble via npm:

    npm install babble

Example usage:

### Simple questions and notifications

Babble can be used to listen for messages and send a reply. In the following
example, emma listens for two messages: "ask age" and "tell age". In the first
case she will reply telling her age, in the second case she just outputs the
received age. Jack first tells his age, and then asks emma's age, waits for
her to reply, and then output the received age.

This scenario can be represented by the following control flow diagram:

![ask age](https://raw.github.com/josdejong/babble/master/img/ask_age.svg)

The scenario is programmed as:

```js
var babble = require('babble'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run;

var emma = babbler('emma').subscribe(),
    jack = babbler('jack').subscribe();

emma.listen('ask age', reply(function () {
  return 25;
}));

emma.listen('tell age', run(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', run(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
```

### Conversations with multiple messages

The following scenario describes two peers planning a meeting in two steps:
First jack asks whether emma has time for a meeting, and if so, jack will
propose to meet, and await emma's response.

This scenario can be represented by the following control flow diagram:

![plan a meeting](https://raw.github.com/josdejong/babble/master/img/plan_a_meeting.svg)

The scenario is coded as:

```js
var babble = require('babble'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run,
    decide = babble.decide;

var emma = babbler('emma').subscribe(),
    jack = babbler('jack').subscribe();

emma.listen('do you have time today?', decide(function (response) {
  if (Math.random() > 0.4) {
    return reply(function () {
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
    }));
  }
  else {
    return reply(function () {
      return 'no';
    });
  }
})
);

jack.ask('emma', 'do you have time today?', decide(function (response) {
  if (response == 'yes') {
    return reply(function () {
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
    }));
  }
  else {
    return run(function () {
      console.log('emma has no time');
    });
  }
}));
```

## API

TODO: describe API


## Test

To execute tests for the library, install the project dependencies once:

    npm install

Then, the tests can be executed:

    npm test
