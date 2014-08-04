'use strict';

var Block = require('./Block');

require('./Then'); // extend Block with function then

/**
 * IIf
 * Create an iif block, which checks a condition and continues either with
 * the trueBlock or the falseBlock. The input message is passed to the next
 * block in the flow.
 *
 * Can be used as follows:
 * - When `condition` evaluates true:
 *   - when `trueBlock` is provided, the flow continues with `trueBlock`
 *   - else, when there is a block connected to the IIf block, the flow continues
 *     with that block.
 * - When `condition` evaluates false:
 *   - when `falseBlock` is provided, the flow continues with `falseBlock`
 *
 * Syntax:
 *
 *     new IIf(condition, trueBlock)
 *     new IIf(condition, trueBlock [, falseBlock])
 *     new IIf(condition).then(...)
 *
 * @param {Function | RegExp | *} condition   A condition returning true or false
 *                                            In case of a function,
 *                                            the function is invoked as
 *                                            `condition(message, context)` and
 *                                            must return a boolean. In case of
 *                                            a RegExp, condition will be tested
 *                                            to return true. In other cases,
 *                                            non-strict equality is tested on
 *                                            the input.
 * @param {Block} [trueBlock]
 * @param {Block} [falseBlock]
 * @constructor
 * @extends {Block}
 */
function IIf (condition, trueBlock, falseBlock) {
  if (!(this instanceof IIf)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (condition instanceof Function) {
    this.condition = condition;
  }
  else if (condition instanceof RegExp) {
    this.condition = function (message, context) {
      return condition.test(message);
    }
  }
  else {
    this.condition = function (message, context) {
      return message == condition;
    }
  }

  if (trueBlock && !(trueBlock instanceof Block)) {
    throw new TypeError('Parameter trueBlock must be a Block');
  }

  if (falseBlock && !(falseBlock instanceof Block)) {
    throw new TypeError('Parameter falseBlock must be a Block');
  }

  this.trueBlock = trueBlock || null;
  this.falseBlock = falseBlock || null;
}

IIf.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
IIf.prototype.execute = function (message, context) {
  var next = null;
  if (this.condition(message, context)) {
    next = this.trueBlock || this.next;
  }
  else {
    next = this.falseBlock;
  }

  return {
    result: message,
    block: next
  };
};

/**
 * IIf
 * Create an iif block, which checks a condition and continues either with
 * the trueBlock or the falseBlock. The input message is passed to the next
 * block in the flow.
 *
 * Can be used as follows:
 * - When `condition` evaluates true:
 *   - when `trueBlock` is provided, the flow continues with `trueBlock`
 *   - else, when there is a block connected to the IIf block, the flow continues
 *     with that block.
 * - When `condition` evaluates false:
 *   - when `falseBlock` is provided, the flow continues with `falseBlock`
 *
 * Syntax:
 *
 *     new IIf(condition, trueBlock)
 *     new IIf(condition, trueBlock [, falseBlock])
 *     new IIf(condition).then(...)
 *
 * @param {Function | RegExp | *} condition   A condition returning true or false
 *                                            In case of a function,
 *                                            the function is invoked as
 *                                            `condition(message, context)` and
 *                                            must return a boolean. In case of
 *                                            a RegExp, condition will be tested
 *                                            to return true. In other cases,
 *                                            non-strict equality is tested on
 *                                            the input.
 * @param {Block} [trueBlock]
 * @param {Block} [falseBlock]
 * @returns {Block}
 */
Block.prototype.iif = function (condition, trueBlock, falseBlock) {
  var iif = new IIf(condition, trueBlock, falseBlock);

  return this.then(iif);
};

module.exports = IIf;
