'use strict';

/**
 * Abstract control flow diagram block
 * @constructor
 */
function Block() {
  this.next = null;
  this.previous = null;
}

/**
 * Execute the block
 * @param {Conversation} conversation
 * @param {*} message
 * @return {Promise.<{result: *, block: Block}, Error>} next
 */
Block.prototype.execute = function (conversation, message) {
  throw new Error('Cannot run an abstract Block');
};

module.exports = Block;
