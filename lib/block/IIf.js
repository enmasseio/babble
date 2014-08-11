'use strict';

var Promise = require('es6-promise').Promise;
var Block = require('./Block');
var isPromise = require('../util').isPromise;

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
IIf.prototype.constructor = IIf;

/**
 * Execute the block
 * @param {Conversation} conversation
 * @param {*} message
 * @return {Promise.<{result: *, block: Block}, Error>} next
 */
IIf.prototype.execute = function (conversation, message) {
  var me = this;
  var condition = this.condition(message, conversation.context);

  var resolve = isPromise(condition) ? condition : Promise.resolve(condition);

  return resolve.then(function (condition) {
    var next = condition ? (me.trueBlock || me.next) : me.falseBlock;

    return {
      result: message,
      block: next
    };
  });
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
 * @returns {Block} Returns the created IIf block
 */
Block.prototype.iif = function (condition, trueBlock, falseBlock) {
  var iif = new IIf(condition, trueBlock, falseBlock);

  return this.then(iif);
};

module.exports = IIf;
