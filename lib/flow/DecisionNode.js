var FlowNode = require('./FlowNode');

/**
 * DecisionNode
 * A decision is made by executing the provided callback function, which returns
 * a next Action.
 * @param {Function} callback   Invoked as fn(response),
 *                              where response is the latest message received.
 *                              Must return a FlowNode element.
 * @constructor
 * @extends {FlowNode}
 */
function DecisionNode (callback) {
  if (!(this instanceof DecisionNode)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  if (!(typeof callback === 'function')) {
    throw new TypeError('Parameter callback must be a Function');
  }

  this.callback = callback;
}

DecisionNode.prototype = Object.create(FlowNode.prototype);

/**
 * Run the node
 * @param {Object} context
 * @param {String} [arg]
 * @return {{result: *, node: FlowNode}} next
 */
DecisionNode.run = function run (context, arg) {
  var next = this.callback.apply(context, (arg !== undefined) ? [arg] : []);

  if (next && !(next instanceof FlowNode)) {
    throw new TypeError('DecisionNode function must return a FlowNode');
  }

  return {
    result: undefined,
    node: next
  };
};

module.exports = DecisionNode;
