# Babble

Dynamic communication flows between message based actors.

Babble makes it easy to code communication flows between actors. A conversation
is modeled as a control flow diagram containing blocks `listen`, `ask`, `tell`,
`reply`, `decide`, and `run`. Each block can link to a next block in the
control flow. Conversations are dynamic: a scenario is build programmatically,
and the blocks can dynamically determine the next block in the scenario.
During a conversation, a context is available to store the state of the
conversation.

Babble uses pubsub to communicate between actors. It comes with built in
support to communicate locally, and has as support for
[pubnub](http://www.pubnub.com/) to connect actors distributed over multiple
devices.

Babble runs in node.js and in the browser.


## Usage

Install babble via npm:

    npm install babble

Load in node.js:

```js
var babble = require('babble');
```

Load in the browser:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- load pubnub, only needed when using pubnub -->
  <script src="http://cdnjs.cloudflare.com/ajax/libs/pubnub/3.5.4/pubnub.min.js"></script>

  <!-- load babble -->
  <script src="../../dist/babble.min.js"></script>
</head>
<body>
</body>
</html>
```

Then babble can be loaded and used:

```js

var babble = require('babble');

var emma = babble.babbler('emma').subscribe(),
    jack = babble.babbler('jack').subscribe();

emma.listen('ask age', babble.reply(function () {
  return 25;
}));

jack.ask('emma', 'ask age', babble.run(function (age, context) {
  console.log(context.from + ' is ' + age + ' years old');
}));
```


## Examples

### Ask a question

Babble can be used to listen for messages and send a reply. In the following
example, emma listens for two messages: "ask age" and "tell age". In the first
case she will reply telling her age, in the second case she just outputs the
received age. Jack first tells his age, and then asks emma's age, waits for
her to reply, and then output the received age.

This scenario can be represented by the following control flow diagram:

![ask age](https://raw.github.com/josdejong/babble/master/img/ask_age.jpg)

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

emma.listen('tell age', run(function (age, context) {
  console.log(context.from + ' is ' +  age + ' years old');
}));

jack.tell('emma', 'tell age', 27);

jack.ask('emma', 'ask age', run(function (age, context) {
  console.log(context.from + ' is ' + age + ' years old');
}));
```

### Have a conversation

The following scenario describes two peers planning a meeting in two steps:
First jack asks whether emma has time for a meeting, and if so, jack will
propose to meet, and await emma's response.

This scenario can be represented by the following control flow diagram:

![plan a meeting](https://raw.github.com/josdejong/babble/master/img/plan_a_meeting.jpg)

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
}));

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

Babble has the following factory functions:

- `babble.babbler(id: String) : Babbler`
  Factory function to create a new Babbler.
- `babble.run(callback: Function [, next: Block]) : Action`
  Factory function to create an Action block. The provided callback function
  is called as `callback(response, context)` and should not return a result.
- `babble.decide(callback: Function) : Decision`
  Factory function to create a Decision block. The callback function is called
  as `callback(response, context) : Block`, and must return an instance of
  `Block` (an Action, Reply, or Decision). The returned block is used as next
  block in the control flow.
- `babble.reply(callback: Function [, next: Block]) : Reply`
  Factory function to create a Reply block. The provided callback function
  is called as `callback(response, context)`, where `response` is the latest
  received message, and must return a result. The returned result is send to the
  connected peer.

Babble contains the following prototypes. These prototypes are normally
instantiated via the above mentioned factory functions.

- `babble.Babbler`
- `babble.block.Block`
- `babble.block.Action`
- `babble.block.Decision`
- `babble.block.Reply`
- `babble.block.Trigger`

### Babbler

A babbler is created via the factory function `babble.babbler(id: String)`.
A babbler has the following functions:

- `subscribe([pubsub: Object] [, callback])`
  Subscribe to a pubsub system. Babble comes with interfaces to support various
  pubsub systems: `pubnub`, `pubsub-js`, and `default`. These interfaces are
  available in the `babble.pubsub` namespace.  If parameter `pubsub` is not
  provided, babble uses the `default` pubsub system, which works locally.
  A pubsub system can be specified like:

  ```js
  babbler.subscribe(babble.pubsub['pubnub'], function () {
    // connected
  });
  ```

- `unsubscribe()`
  Unsubscribe from the subscribed pubsub system.

- `publish(id: String, message: *)`
  Send a message to another peer.

- `listen(message: String, next: Block)`
  Listen for incoming messages. If there is a match, the provided
  control flow block `next` will be executed.

- `tell(id: String, message: String [, data: JSON])`
  Send a notification to another peer.

- `ask(id: String, message: String [,data: JSON], next: Block)`
  Send a question to another peer. When the reply comes in,
  the provided control flow block `next` is executed.


## Build

Babble can be build for use in the browser. This is done using the tools
browserify and uglify. First install all project dependencies:

    npm install

To build the library `./dist/babble.js`, run:

    npm run build

To build and minify the library `./dist/babble.min.js`, run:

    npm run minify


## Test

To execute tests for the library, install the project dependencies once:

    npm install

Then, the tests can be executed:

    npm test
