var assert = require('assert'),
    babble = require('../index'),
    Babbler = require('../lib/Babbler'),
    FlowBuilder = require('../lib/FlowBuilder'),

    Reply = require('../lib/block/Reply'),
    Decision = require('../lib/block/Decision'),
    Action = require('../lib/block/Action');

describe('babbler', function() {

  it('should create a babbler', function() {
    var emma = babble.babbler('emma0');
    assert.ok(emma instanceof Babbler);
  });

  it('should throw an error when creating a Babbler without id', function() {
    assert.throws(function () {babble.babbler(); });
  });

  it('should create a flow starting with a reply block', function() {
    var builder = babble.reply(function () {});
    assert.ok(builder instanceof FlowBuilder);
    assert.ok(builder.done() instanceof Reply);
  });

  it('should create a flow starting with a decision block', function() {
    var builder = babble.decide(function () {});
    assert.ok(builder instanceof FlowBuilder);
    assert.ok(builder.done() instanceof Decision);
  });

  it('should create a flow starting with an action block', function() {
    var builder = babble.run(function () {});
    assert.ok(builder instanceof FlowBuilder);
    assert.ok(builder.done() instanceof Action);
  });

  // TODO: test reply, decide, run
});
