var Flow = require('./Flow');

/**
 * Reply
 * Handle a reply to an incoming message.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the incoming message.
 *                              The return value of fn is send back to the
 *                              sender
 * @param {Flow} next           The next flow element
 * @constructor
 * @extends {Flow}
 */
function Reply (callback, next) {
  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  if (!(next instanceof Flow)) {
    throw new TypeError('Parameter next must be a Flow');
  }

  this.callback = callback;
  this.next = next;
}

Reply.prototype = Object.create(Flow.prototype);


module.exports = Reply;
