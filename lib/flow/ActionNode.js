var FlowNode = require('./FlowNode');

/**
 * ActionNode
 * Execute an action.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the last received message.
 * @param {FlowNode} next       The next flow node
 * @constructor
 * @extends {FlowNode}
 */
function ActionNode (callback, next) {
  if (!(this instanceof ActionNode)) {
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

ActionNode.prototype = Object.create(FlowNode.prototype);

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
ActionNode.prototype.run = function run (context, arg) {
  this.callback.apply(context, (arg !== undefined) ? [arg] : []);

  return {
    result: undefined,
    node: this.next
  };
};

module.exports = ActionNode;
