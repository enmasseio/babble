var uuid = require('node-uuid'),

    Block = require('./block/Block'),
    Action = require('./block/Action'),
    Reply = require('./block/Reply'),
    Decision = require('./block/Decision'),
    Listen = require('./block/Listen');

/**
 * A conversation flow between two peers
 * @constructor
 * @param {Block} block       A control flow block
 */
function Flow (block) {
  if (!(this instanceof Flow)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(block instanceof Block)) {
    throw new TypeError('Parameter block must be a Block');
  }

  this.block = block;
}

/**
 * Wait until a message comes in, then execute the callback.
 * @return {Flow} flow     A flow object to chain the next block
 */
Flow.prototype.listen = function listen () {
  var block = new Listen();

  this.block.chain(block);

  return new Flow(block);
};

/**
 * Execute the given callback and send the return value to the other peer.
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 *                              Must return a result
 * @return {Flow} flow     A flow object to chain the next block
 */
Flow.prototype.reply = function reply (callback) {
  var block = new Reply(callback);

  this.block.chain(block);

  return new Flow(block);
};

/**
 * Execute the given callback, continue with the conversation with returned id
 * @param {Function} decision
 * @return {Flow} flow     A flow object to chain the next block
 */
Flow.prototype.decide = function decide (decision) {
  var block = new Decision(decision);

  this.block.chain(block);

  return new Flow(block);
};

/**
 * Execute the given callback and continue with the next conversation
 * @param {Function} callback   Executed as callback(message: *, context: Object)
 * @return {Flow} flow     A flow object to chain the next block
 */
Flow.prototype.run = function run (callback) {
  var block = new Action(callback);

  this.block.chain(block);

  return new Flow(block);
};

module.exports = Flow;
