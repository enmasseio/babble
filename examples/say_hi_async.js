// All callbacks in babble can return a Promise in order to allow
// asynchronous tasks.

var Promise = require('es6-promise').Promise; // pick your favorite Promise library
var babble = require('../index');

var emma = babble.babbler('emma');
var jack = babble.babbler('jack');

emma.listen('hi')
    .listen(function (message, context) {
      console.log(context.from + ': ' + message);
      return message;
    })
    .decide(function (message, context) {
      // return a promise which we will resolve later on
      return new Promise(function (resolve, reject) {
        console.log('emma is thinking...');

        // take some time to think...
        setTimeout(function () {
          // ok make a decision and resolve the promise
          var decision = (message.indexOf('age') != -1) ? 'age' : 'name';
          resolve(decision);
        }, 1000);
      });
    }, {
      'name': babble.tell('hi, my name is emma'),
      'age':  babble.tell('hi, my age is 27')
    });

jack.tell('emma', 'hi')
    .tell(function (message, context) {
      // return a promise which we will resolve later on
      return new Promise(function (resolve, reject) {
        console.log('jack is typing a message...');

        // pretend it takes some time to type a message
        setTimeout(function () {
          if (Math.random() > 0.5) {
            resolve('my name is jack');
          } else {
            resolve('my age is 25');
          }
        }, 1000);
      });

    })
    .listen(function (message, context) {
      console.log(context.from + ': ' + message);
    });
