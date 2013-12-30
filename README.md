# Babble

Distributed conversations over pubsub. Tell, ask, reply.

Babble makes it easy to create dynamic communication flows between peers.


## Usage

Install babble via npm:

    npm install babble

Example usage:

### Simple request/response

```js
var babble = require('../index');

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.listen('ask age').then(function () {
  return 25;
});

emma.listen('tell age').then(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
});

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age').then(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
});
```

### Conversation with multiple replies

```js
var babble = require('babble');

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.listen('How are you doing?').when(function () {
    return Math.random() > 0.2;
  },
  conversation(function () {
    return 'great';
  }),
  conversation(function () {
    return 'not good';
  }).when({
    'Why?': conversation(function () {
      return 'I got my nose smashed in against the wall';
    }),
    'ha ha': conversation(function () {
      return 'Shut up!';
    })
  })
);

jack.ask('emma', 'How are you doing?').when({
  'mwa': when(function () {
      return Math.random() > 0.5;
    },
    conversation (function () {
      return 'Why?';
    }),
    conversation (function () {
    })
  )
});
```


## Test

To execute tests for the library, install the project dependencies once:

    npm install

Then, the tests can be executed:

    npm test
