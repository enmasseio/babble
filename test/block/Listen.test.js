var assert = require('assert'),
    Listen = require('../../lib/block/Listen'),
    Block = require('../../lib/block/Block');

describe('Listen', function() {

  it('should create a listener', function () {
    var listener1 = new Listen(new Block());
    assert.ok(listener1 instanceof Listen);
  });

  it('should throw an error when wrongly creating a listener', function () {
    assert.throws(function () { Listen(new Block()) }, SyntaxError);
  });

  it('should execute a listener', function () {
    var block = new Block();
    var listener = new Listen(block);

    var next = listener.execute();
    assert.strictEqual(next.result, undefined);
    assert.strictEqual(next.block, block);
  });

});
