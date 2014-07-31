# Babble

Dynamic communication flows between message based actors.

Babble makes it easy to code communication flows between actors. A conversation
is modeled as a control flow diagram containing blocks `ask`, `tell`, `listen`,
`decide`, and `then`. Each block can link to a next block in the
control flow. Conversations are dynamic: a scenario is build programmatically,
and the blocks can dynamically determine the next block in the scenario.
During a conversation, a context is available to store the state of the
conversation.

Babble uses customizable messaging to communicate between actors. It comes with
built in support to communicate locally, and has as support for
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

var emma = babble.babbler('emma').connect(),
    jack = babble.babbler('jack').connect();

emma.listen('what is your age?')
    .tell(function () {
      return 25;
    });

jack.ask('emma', 'what is your age?', function (age, context) {
  console.log(context.from + ' is ' + age + ' years old');
});
```

## Control flow

TODO: describe control flow blocks


## Examples

### Say hi

Babble can be used to listen for messages and send a reply. In the following
example, emma listens for a message "hi", then she will listen to the next
message. Depending on the contents of this second message, she determines how
to respond. Jack says hi to emma, then tells his name or age, and awaits a
response from emma.

This scenario can be represented by the following control flow diagram:

![ask age](https://raw.github.com/enmasseio/babble/master/img/say_hi.png)

The scenario can be programmed as:

```js
var babble = require('babble');

var emma = babble.babbler('emma').connect(),
    jack = babble.babbler('jack').connect();

function printMessage (message, context) {
  console.log(context.from + ': ' + message);
  return message;
}

emma.listen('hi')
    .listen(printMessage)
    .decide(function (message, context) {
      return (message.indexOf('age') != -1) ? 'age' : 'name';
    }, {
      'name': babble.tell('hi, my name is emma'),
      'age':  babble.tell('hi, my age is 27')
    });

jack.tell('emma', 'hi')
    .tell(function (message, context) {
      if (Math.random() > 0.5) {
        return 'my name is jack'
      } else {
        return 'my age is 25';
      }
    })
    .listen()
    .then(printMessage);
```

### Plan a meeting

The following scenario describes two peers planning a meeting in two steps:
First jack asks whether emma has time for a meeting, and if so, jack will
propose to meet, and await emma's response.

This scenario can be represented by the following control flow diagram:

![plan a meeting](https://raw.github.com/enmasseio/babble/master/img/plan_a_meeting.png)

The scenario can be coded as follows. Note that the implementations of the
control flow blocks are separated from the flow itself.

```js
var babble = require('babble');

var emma = babble.babbler('emma').connect(),
    jack = babble.babbler('jack').connect();

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

emma.listen('do you have time today?')
    .decide(decideIfAvailable, {
      yes: babble.tell('yes')
              .listen()
              .decide(decideToAgree, {
                ok: babble.tell('ok'),
                no: babble.tell('no')
              }),
      no: babble.tell('no')
    });

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
      yes: babble.tell('can we meet at 15:00?')
              .listen()
              .decide(agreesToMeet, {
                ok: babble.then(agreement),
                no: babble.then(noAgreement)
              }),
      no: babble.then(noTime)
    });

```


## API

Babble has the following factory functions:

- `babble.babbler(id: String) : Babbler`  
  Factory function to create a new Babbler.
- `babble.decide([decision: Function, ] choices: Object<String, Block>) : Block`  
  Create a flow starting with a Decision block.
  When a `decision` function is provided, the function is invoked as
  `decision(response, context)`. The function must return the id for the next
  block in the control flow, which must be available in the provided `options`.
  If `decision` is not provided, the next block will be mapped directly from the
  `response`. Parameter `choices` is a map with the possible next blocks in the
  flow. The next block is selected by the id returned by the `decision` function.
  The returned block is used as next block in the control flow.
- `babble.tell(message: Function | *) : Block`  
  Create a flow starting with a Tell block. Message can be a static value,
  or a callback function returning a message dynamically. The callback function
  is called as `callback(response, context)`, where `response` is the latest
  received message, and must return a result.
  The returned result is send to the connected peer.
- `babble.then(next: Block | function) : Block`  
  Create a flow starting with given block. When a callback function is provided,
  the function is wrapped into a `Then` block. The provided callback function
  is called as `callback(response, context)`, where `response` is the latest
  received message, and must return a result. The returned result is passed to 
  the next block in the chain.

Babble contains the following prototypes. These prototypes are normally
instantiated via the above mentioned factory functions.

- `babble.Babbler`
- `babble.block.Block`
- `babble.block.Then`
- `babble.block.Decision`
- `babble.block.Tell`
- `babble.block.Start`

### Babbler

A babbler is created via the factory function `babble.babbler(id: String)`.
A babbler has the following functions:

- `connect([messager: Object] [, callback])`  
  Connect to a messaging system. Babble comes with interfaces to support various
  messaging systems: `pubnub`, `pubsub-js`, and `default`. These interfaces are
  available in the `babble.messagers` namespace.  If parameter `messager` is not
  provided, babble uses the `default` messaging system, which works locally.
  A messaging system can be specified like:

  ```js
  babbler.connect(babble.messagers['pubnub'], function () {
    // connected
  });
  ```

- `disconnect()`  
  Disconnect from the connected messaging system.

- `send(id: String, message: *)`  
  Send a message to another peer.

- `listen(message: String [, callback: Function]) : Block`  
  Listen for incoming messages. If there is a match, the returned control flow
  block will be executed. Other blocks can be chained to the returned block.

- `tell(id: String, message: Function | *)`  
  Send a notification to another peer.

- `ask(id: String, message: String [, callback: Function]) : Block`  
  Send a question to another peer. Other blocks can be chained to the returned
  block.

### Block

Blocks can be created via the factory functions available in `babble`
(`tell`, `decide`, `then`, `listen`), or in a Babbler (`listen`, `tell`,
`ask`). Blocks can be chained together, resulting in a control flow. The results
returned by blocks are used as input argument for the next block in the chain.

A Block has the following functions:

- `decide([decision: function, ] choices: Object<String, Block>) : Block`  
  Append a decision block to the control flow. Returns the first block in the
  chain.
- `tell(message: *) : Block`  
  Append a Tell block to the control flow. Parameter `message` can be callback
  function or an object or value. Returns the first block in the chain.
- `listen([callback: Function]) : Block`  
  Append a Listen block to the control flow. Returns the first block in the
  chain.
- `then(block : Block | function) : Block`  
  Append an arbitrary block to the control flow. When a callback function is
  provided, it is wrapped into a `Then` block and added to the chain.
  Returns the first block in the chain.


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


# To do

- Implement mixin pattern, enrich any object (like an actor) with babbler functionality.
- Listen to patterns instead of a predefined message.
- Implement error handling
- Implement support for promises to allow async callback functions
- Store message history in the context.
- Implement conversations with multiple peers at the same time.
