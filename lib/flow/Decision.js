var Flow = require('./Flow');

/**
 * Decision
 * A decision is made by executing the provided callback function, which returns
 * a next Action.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a Flow element.
 * @constructor
 * @extends {Flow}
 */
function Decision (callback) {
  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = function () {
    var next = callback.apply(callback, arguments);

    if (!(next instanceof Flow)) {
      throw new TypeError('Decision function must return a Flow');
    }

    return next;
  };
}

Decision.prototype = Object.create(Flow.prototype);

module.exports = Decision;
