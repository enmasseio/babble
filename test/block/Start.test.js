var assert = require('assert'),
    Start = require('../../lib/block/Start'),
    Block = require('../../lib/block/Block');

describe('Listen', function() {

  it('should create a start block', function () {
    var start1 = new Start(new Block());
    assert.ok(start1 instanceof Start);
  });

  it('should throw an error when wrongly creating a start block', function () {
    assert.throws(function () { Start(new Block()) }, SyntaxError);
  });

  it('should execute a start block', function () {
    var start = new Start();
    var block = new Block();
    start.then(block);

    var next = start.execute();
    assert.strictEqual(next.result, undefined);
    assert.strictEqual(next.block, block);
  });

});
