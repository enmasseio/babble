var uuid = require('node-uuid'),

    Block = require('./block/Block'),
    Action = require('./block/Action'),
    Reply = require('./block/Reply'),
    Decision = require('./block/Decision'),
    Start = require('./block/Start');

/**
 * Build a conversation flow between two peers
 * @constructor
 * @param {Block} block       A control flow block
 */
function FlowBuilder (block) {
  if (!(this instanceof FlowBuilder)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(block instanceof Block)) {
    throw new TypeError('Parameter block must be a Block');
  }

  this.first = block;
  this.last = block;

  this.listeners = {
    done: []
  };
}

/**
 * Register an event handler for the FlowBuilder
 * @param {String} event      Available events: 'done'
 * @param {function} callback Callback is invoked when the event takes place.
 *                            Is invoked without parameters.
 */
FlowBuilder.prototype.on = function on (event, callback) {
  switch (event) {
    case 'done':
      this.listeners.done.push(callback);
      break;

    default:
      throw new Error('Unknown event "' + event + '"');
  }
};

/**
 * Trigger an event
 * @param {string} event
 * @private
 */
FlowBuilder.prototype._trigger = function _trigger (event) {
  var callbacks = this.listeners[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback();
    });
  }
};

/**
 * Finalize this control flow, returns the first block in the created control
 * flow.
 * @return {Block} first
 */
FlowBuilder.prototype.done = function done () {
  // TODO: add an error handling block at the end

  this._trigger('done');

  return this.first;
};

/**
 * Execute the given callback and send the return value to the other peer.
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {FlowBuilder} self
 */
FlowBuilder.prototype.reply = function reply (callback) {
  var block = new Reply(callback);

  this.last.chain(block);
  this.last = block;

  return this;
};

/**
 * Append a next block to the control flow
 * @param {Block} block        Next block in the control flow
 * @return {FlowBuilder} self
 */
FlowBuilder.prototype.then = function then (block) {
  this.last.chain(block);
  this.last = block;

  return this;
};

/**
 * Execute the given callback, continue with the conversation with returned id
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
 * @return {FlowBuilder} self
 */
FlowBuilder.prototype.decide = function decide (arg1, arg2) {
  // TODO: test arguments.length > 2
  var block = new Decision(arg1, arg2);

  this.last.chain(block);
  this.last = block;

  return this;
};

/**
 * Execute the given callback and continue with the next conversation
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 * @return {FlowBuilder} self
 */
FlowBuilder.prototype.run = function run (callback) {
  var block = new Action(callback);

  this.last.chain(block);
  this.last = block;

  return this;
};

module.exports = FlowBuilder;
