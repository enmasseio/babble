var uuid = require('node-uuid'),

    Block = require('./block/Block'),
    Action = require('./block/Action'),
    Reply = require('./block/Reply'),
    Decision = require('./block/Decision'),
    Listen = require('./block/Listen');

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

  this.block = block;
}

/**
 * Wait until a message comes in, then execute the callback.
 * @return {FlowBuilder} flow     A flow object to chain the next block
 */
FlowBuilder.prototype.listen = function listen () {
  var block = new Listen();

  this.block.chain(block);

  return new FlowBuilder(block);
};

/**
 * Execute the given callback and send the return value to the other peer.
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {FlowBuilder} flow     A flow object to chain the next block
 */
FlowBuilder.prototype.reply = function reply (callback) {
  var block = new Reply(callback);

  this.block.chain(block);

  return new FlowBuilder(block);
};

/**
 * Execute the given callback, continue with the conversation with returned id
 * @param {Function} decision
 * @return {FlowBuilder} flow     A flow object to chain the next block
 */
FlowBuilder.prototype.decide = function decide (decision) {
  var block = new Decision(decision);

  this.block.chain(block);

  return new FlowBuilder(block);
};

/**
 * Execute the given callback and continue with the next conversation
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 * @return {FlowBuilder} flow     A flow object to chain the next block
 */
FlowBuilder.prototype.run = function run (callback) {
  var block = new Action(callback);

  this.block.chain(block);

  return new FlowBuilder(block);
};

module.exports = FlowBuilder;
