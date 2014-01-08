var Block = require('./Block');

/**
 * Decision
 * A decision is made by executing the provided callback function, which returns
 * a next Action.
 * @param {Function | Object} decision
 *                              When `decision` is a function, the function is
 *                              invoked as decision(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. The function must
 *                              return a Block element.
 *                              When `decision` is an object, it must contain
 *                              a map with response:String as keys and
 *                              next:Block as next control flow block.
 * @constructor
 * @extends {Block}
 */
function Decision (decision) {
  if (!(this instanceof Decision)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if ((typeof decision === 'function')) {
    // great, a function (should return a Block).
  }
  else if (decision) {
    // a map with properties. Test whether all property values are blocks
    Object.keys(decision).forEach(function (key) {
      if (!(decision[key] instanceof Block)) {
        throw new TypeError('Decision map must contain Blocks');
      }
    });
  }
  else {
    throw new TypeError('Function or Object expected as first parameter');
  }

  // other Blocks do have a second argument `next` so that is an easy pitfall...
  if (arguments[1] instanceof Block) {
    throw new SyntaxError('Decision doesn\'t accept a second parameter');
  }

  this.decision = decision;
}

Decision.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Decision.prototype.execute = function execute (context, arg) {
  var next;
  if (typeof this.decision === 'function') {
    next = this.decision(arg, context);

    if (next && !(next instanceof Block)) {
      throw new TypeError('Decision function must return a Block');
    }
  }
  else {
    next = this.decision[arg];
  }

  return {
    result: undefined,
    block: next
  };
};

module.exports = Decision;
