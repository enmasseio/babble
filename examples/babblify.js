var babble = require('../index');

/******************************
 *
 * Create a simple actor system
 *
 ******************************/

function Actor(id) {
  this.id = id;
  Actor.actors[id] = this;
}

Actor.actors = {}; // map with all actors by their id

Actor.prototype.send = function (to, message) {
  var actor = Actor.actors[to];
  if (!actor) {
    throw new Error('Not found');
  }
  actor.receive(this.id, message);
};

Actor.prototype.receive = function (from, message) {
  // ... to be overwritten by the actor
};



/******************************
 *
 * Regular usage
 *
 ******************************/

var emma = new Actor('emma');
var jack = new Actor('jack');

emma.receive = function (from, message) {
  console.log('Received a message from ' + from + ': "' + message + '"')
};

jack.send('emma', 'hello emma!');




/******************************
 *
 * Babblified usage
 *
 ******************************/

// create two actors and babblify them
var susan = babble.babblify(new Actor('susan'));
var john = babble.babblify(new Actor('john'));

susan.listen('hi')
    .listen(printMessage)
    .decide(function (message, context) {
      return (message.indexOf('age') != -1) ? 'age' : 'name';
    }, {
      'name': babble.tell('hi, my name is susan'),
      'age':  babble.tell('hi, my age is 27')
    });

john.tell('susan', 'hi')
    .tell(function (message, context) {
      if (Math.random() > 0.5) {
        return 'my name is john'
      } else {
        return 'my age is 25';
      }
    })
    .listen(printMessage);

function printMessage (message, context) {
  console.log(context.from + ': ' + message);
  return message;
}
