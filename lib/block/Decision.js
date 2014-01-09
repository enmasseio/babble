var Block = require('./Block');

/**
 * Decision
 * A decision is made by executing the provided callback function, which returns
 * a next control flow block.
 *
 * Syntax:
 *
 *     new Decision(choices)
 *     new Decision(decision, choices)
 *
 * Where:
 *
 *     {Function | Object} [decision]
 *                              When a `decision` function is provided, the
 *                              function is invoked as decision(response, context),
 *                              where `response` is the last received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. The function must
 *                              return the id for the next block in the control
 *                              flow, which must be available in the provided
 *                              `options`. If `decision` is not provided, the
 *                              next block will be mapped directly from the
 *                              response.
 *     {Object.<String, Block>} choices
 *                              A map with the possible next blocks in the flow
 *                              The next block is selected by the id returned
 *                              by the decision function.
 *
 * @param arg1   Can be {function} decision or {Object} choices
 * @param [arg2] {Object} choices
 * @constructor
 * @extends {Block}
 */
function Decision (arg1, arg2) {
  var decision, choices;

  if (!(this instanceof Decision)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (typeof arg1 === 'function') {
    decision = arg1;
    choices = arg2;
  }
  else {
    decision = null;
    choices = arg1;
  }

  if (!decision) {
    decision = function (response) {
      return response;
    }
  }
  else if ((typeof decision !== 'function')) {
    throw new TypeError('Parameter decision must be a function');
  }
  if (!choices || choices instanceof Function) {
    throw new TypeError('Parameter choices must be an object');
  }

  // Test whether all choices values are blocks
  Object.keys(choices).forEach(function (id) {
    if (!(choices[id] instanceof Block)) {
      throw new TypeError('choices must be an object containing Blocks');
    }
  });

  this.decision = decision;
  this.choices = choices;
}

Decision.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, block: Block}} next
 */
Decision.prototype.execute = function execute (context, arg) {
  var id = this.decision(arg, context);

  if (typeof id !== 'string') {
    throw new TypeError('Decision function must return a string containing ' +
        'the id of the next block');
  }

  var next = this.choices[id];
  if (!next) {
    throw new Error('Block with id "' + id + '" not found');
  }

  return {
    result: undefined,
    block: next
  };
};

module.exports = Decision;
