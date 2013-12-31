/**
 * Abstract flow node
 * @constructor
 */
function FlowNode() {}

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
FlowNode.prototype.run = function run (context, arg) {
  throw new Error('Cannot run an abstract FlowNode');
};

module.exports = FlowNode;