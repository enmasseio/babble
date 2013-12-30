var Flow = require('./Flow');

/**
 * Execute an action, then proceed with the next action.
 * @param {Function } callback  Function is invoked as callback(response),
 *                              where response is the latest received message.
 *                              Function must return nothing.
 * @param {Flow} next           The next flow element.
 * @constructor
 * @extends {Flow}
 */
function Action (callback, next) {
  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  if (!(next instanceof Flow)) {
    throw new TypeError('Parameter next must be a Flow');
  }

  this.callback = callback;
  this.next = next;
}

Action.prototype = Object.create(Flow.prototype);

module.exports = Action;
