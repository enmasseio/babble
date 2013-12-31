var FlowNode = require('./FlowNode');

/**
 * TriggerNode
 * Create an event trigger. When triggered, the next FlowNode element will be
 * invoked.
 * @param {FlowNode} next   The next flow node
 * @constructor
 * @extends {FlowNode}
 */
function TriggerNode (next) {
  if (!(this instanceof TriggerNode)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(next instanceof FlowNode)) {
    throw new TypeError('Parameter next must be a FlowNode');
  }

  this.next = next;
}

TriggerNode.prototype = Object.create(FlowNode.prototype);

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
TriggerNode.prototype.run = function run (context, arg) {
  return {
    result: undefined,
    node: this.next
  };
};

module.exports = TriggerNode;
