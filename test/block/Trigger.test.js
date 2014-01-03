var assert = require('assert'),
    Trigger = require('../../lib/block/Trigger'),
    Block = require('../../lib/block/Block');

describe('Trigger', function() {

  it('should create a trigger', function () {
    var trigger1 = new Trigger(new Block());
    assert.ok(trigger1 instanceof Trigger);
  });

  it('should throw an error when wrongly creating a trigger', function () {
    assert.throws(function () { Trigger(new Block()) }, SyntaxError);
    assert.throws(function () { new Trigger()}, TypeError);
    assert.throws(function () { new Trigger('bla')}, TypeError);
  });

  it('should run a trigger', function () {
    var block = new Block();
    var trigger = new Trigger(block);

    var next = trigger.run();
    assert.strictEqual(next.result, undefined);
    assert.strictEqual(next.block, block);
  });

});
