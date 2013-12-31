# Babble

Dynamic communication flows between message based actors.


## Usage

Install babble via npm:

    npm install babble

Example usage:

### Simple questions and notifications

```js
var babble = require('../index'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run;

var emma = babbler('emma'),
    jack = babbler('jack');

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

```js
var babble = require('babble'),
    babbler = babble.babbler,
    reply = babble.reply,
    run = babble.run,
    decide = babble.decide;

var emma = babbler('emma'),
    jack = babbler('jack');

emma.listen('How are you doing?', decide(function (response) {
    if (Math.random() > 0.2) {
      return reply(function () {
        return 'great';
      });
    }
    else {
      return reply(function () {
        return 'not good';
      }, decide(function (response) {
        if (response == 'Why?') {
          return reply(function () {
            return 'I got my nose smashed in against the wall';
          });
        }
        else if (response == 'I don\'t care') {
          return reply(function () {
            return 'Shut up!';
          })
        }
      }));
    }
  })
);

jack.ask('emma', 'How are you doing?', decide(function (response) {
  if (response == 'mwa') {
    return reply(function () {
      return 'Why?';
    }, run(function (response) {
      console.log(response);
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
