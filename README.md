# Babble

Dynamic conversations between peers.

Babble makes it easy to create dynamic communication flows between peers.


## Usage

Install babble via npm:

    npm install babble

Example usage:

### Simple request/response

```js
var babble = require('../index'),
    babbler = babble.babbler,
    act = babble.act;

var emma = babbler('emma'),
    jack = babbler('jack');

emma.listen('ask age', act(function () {
  return 25;
}));

emma.listen('tell age', act(function (age) {
  console.log(this.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', act(function (age) {
  console.log(this.from + ' is ' + age + ' years old');
}));
```

### Conversation with multiple replies

```js
var babble = require('babble'),
    babbler = babble.babbler,
    act = babble.act,
    decide = babble.decide;

var emma = babbler('emma'),
    jack = babbler('jack');

emma.listen('How are you doing?', decide(function (response) {
    if (Math.random() > 0.2) {
      return act(function () {
        return 'great';
      });
    }
    else {
      return act(function () {
        return 'not good';
      }, decide(function (response) {
        if (response == 'Why?') {
          return act(function () {
            return 'I got my nose smashed in against the wall';
          });
        }
        else if (response == 'ha ha') {
          return act(function () {
            return 'Shut up!';
          })
        }
      }));
    }
  })
);

jack.ask('emma', 'How are you doing?', decide(function (response) {
  if (response == 'mwa') {
    return act(function () {
      return 'Why?';
    }, act(function (response) {
      console.log(response);
    });
  }
}));
```


## Test

To execute tests for the library, install the project dependencies once:

    npm install

Then, the tests can be executed:

    npm test
