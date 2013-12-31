var FlowNode = require('./FlowNode');

/**
 * ReplyNode
 * Handle a reply to a message.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the last received message.
 *                              The returned result will be send back to the
 *                              sender.
 * @param {FlowNode} next       The next flow node
 * @constructor
 * @extends {FlowNode}
 */
function ReplyNode (callback, next) {
  if (!(this instanceof ReplyNode)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  if (next && !(next instanceof FlowNode)) {
    throw new TypeError('Parameter next must be a FlowNode');
  }

  this.callback = callback;
  this.next = next;
}

ReplyNode.prototype = Object.create(FlowNode.prototype);

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
ReplyNode.prototype.run = function run (context, arg) {
  var result = this.callback.apply(context, (arg !== undefined) ? [arg] : []);

  if (result === undefined) {
    throw new Error('Callback of ReplyNode returned undefined');
  }

  return {
    result: result,
    node: this.next
  };
};

module.exports = ReplyNode;
