'use strict';

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
 *                              function is invoked as decision(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The function must return the id for the next
 *                              block in the control flow, which must be
 *                              available in the provided `choices`.
 *                              If `decision` is not provided, the next block
 *                              will be mapped directly from the message.
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

  if (decision) {
    if (typeof decision !== 'function') {
      throw new TypeError('Parameter decision must be a function');
    }
  }
  else {
    decision = function (message) {
      return message;
    }
  }

  if (choices && (choices instanceof Function)) {
    throw new TypeError('Parameter choices must be an object');
  }

  this.decision = decision;
  this.choices = {};

  // append all choices
  if (choices) {
    var me = this;
    Object.keys(choices).forEach(function (id) {
      me.addChoice(id, choices[id]);
    });
  }
}

Decision.prototype = Object.create(Block.prototype);

/**
 * Execute the block
 * @param {*} message
 * @param {Object} context
 * @return {{result: *, block: Block}} next
 */
Decision.prototype.execute = function (message, context) {
  var id = this.decision(message, context);

  if (typeof id !== 'string') {
    throw new TypeError('Decision function must return a string containing ' +
        'the id of the next block');
  }

  var next = this.choices[id];
  if (!next) {
    throw new Error('Block with id "' + id + '" not found');
  }

  return {
    result: message,
    block: next
  };
};

/**
 * Add a choice to the decision block
 * @param {String} id
 * @param {Block} block
 * @return {Decision} self
 */
Decision.prototype.addChoice = function (id, block) {
  if (typeof id !== 'string') {
    throw new TypeError('String expected as choice id');
  }

  if (!(block instanceof Block)) {
    throw new TypeError('Block expected as choice');
  }

  if (id in this.choices) {
    throw new Error('Choice with id "' + id + '" already exists');
  }

  this.choices[id] = block;

  return this;
};

/**
 * Create a decision block and chain it to the current block.
 * Returns the first block in the chain.
 *
 * Syntax:
 *
 *     decide(choices)
 *     decide(decision, choices)
 *
 * Where:
 *
 *     {Function | Object} [decision]
 *                              When a `decision` function is provided, the
 *                              function is invoked as decision(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The function must return the id for the next
 *                              block in the control flow, which must be
 *                              available in the provided `choices`.
 *                              If `decision` is not provided, the next block
 *                              will be mapped directly from the message.
 *     {Object.<String, Block>} choices
 *                              A map with the possible next blocks in the flow
 *                              The next block is selected by the id returned
 *                              by the decision function.
 *
 * @param {Function | Object} arg1  Can be {function} decision or {Object} choices
 * @param {Object} [arg2]           choices
 * @return {Block} first            First block in the chain
 */
Block.prototype.decide = function (arg1, arg2) {
  // TODO: test arguments.length > 2
  var decision = new Decision(arg1, arg2);

  return this.then(decision);
};

module.exports = Decision;
