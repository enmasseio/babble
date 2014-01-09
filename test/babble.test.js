var assert = require('assert'),
    babble = require('../index'),
    Babbler = require('../lib/Babbler'),

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
    var block = babble.reply(function () {});
    assert.ok(block instanceof Reply);
  });

  it('should create a flow starting with a decision block', function() {
    var block = babble.decide(function () {}, {});
    assert.ok(block instanceof Decision);
  });

  it('should create a flow starting with an action block', function() {
    var block = babble.run(function () {});
    assert.ok(block instanceof Action);
  });

  // TODO: test reply, decide, run
});
