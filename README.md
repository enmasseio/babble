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

emma.onMessage('ask age', function () {
  return 25;
});

emma.onMessage('tell age', function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
});

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age').onMessage(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
});
```

### Conversation with multiple replies

```js
var babble = require('babble');

var emma = babble.babbler('emma'),
    jack = babble.babbler('jack');

emma.onMessage('How are you doing?', function () {
  if (Math.random() > 0.2) {
    return 'great';
  }
  else {
    return 'not good';
  }
  // TODO: problem here: how to have a different response for each of the replies?
}).onMessage(function (response) {
  if (response == 'Why?') {
    this.reply('I got my nose smashed in against the wall');
  }
});

jack.ask('emma', 'How are you doing?').onMessage(function (response) {
  if (response == 'mwa') {
    if (Math.random() > 0.5) {
      return 'Why?';
    }
    else {
      return 'Here, eat some chocolate';
    }
  }
}).onMessage(function (response) {
  // etc...
}));
```


## Test

To execute tests for the library, install the project dependencies once:

    npm install

Then, the tests can be executed:

    npm test
