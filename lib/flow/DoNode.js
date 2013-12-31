var FlowNode = require('./FlowNode');

/**
 * DoNode
 * Execute an action.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the last received message.
 * @param {FlowNode} next       The next flow node
 * @constructor
 * @extends {FlowNode}
 */
function DoNode (callback, next) {
  if (!(this instanceof DoNode)) {
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

DoNode.prototype = Object.create(FlowNode.prototype);

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
DoNode.prototype.run = function run (context, arg) {
  return {
    result: this.callback.apply(context, (arg !== undefined) ? [arg] : []),
    node: this.next
  };
};

module.exports = DoNode;
