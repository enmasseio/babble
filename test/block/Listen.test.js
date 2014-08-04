var assert = require('assert');
var Block = require('../../lib/block/Block');
var Listen = require('../../lib/block/Listen');
var IIf = require('../../lib/block/IIf');
var Then = require('../../lib/block/Then');

describe('Listen', function() {

  it('should create a listener', function () {
    var listener1 = new Listen();
    assert.ok(listener1 instanceof Listen);

    var listener2 = new Listen(function () {});
    assert.ok(listener2 instanceof Listen);
  });

  it('should throw an error when wrongly creating a listener', function () {
    assert.throws(function () { Listen(function () {}) }, SyntaxError);
  });

  it('should execute a listener without arguments', function () {
    var listener = new Listen();

    var next = listener.execute('foo');
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a listener with next block', function () {
    var listener = new Listen();
    var nextListener = new Listen ();
    listener.then(nextListener);

    var next = listener.execute('foo');
    assert.strictEqual(next.result, 'foo');
    assert.strictEqual(next.block, nextListener);
  });

  it('should create a listen+iif block from function .listen', function () {
    var block = new Block();
    var callback = function (message) {
      return message + 'bar';
    };
    var listen = block.listen(callback);

    assert(block.next instanceof Listen);
    assert(listen.next.next instanceof Then);

    var next = block.next.execute('foo');
    assert(next.block instanceof Then);
    assert.strictEqual(next.result, 'foo');

    next = next.block.execute('foo');
    assert.equal(next.block, null);
    assert.strictEqual(next.result, 'foobar');
  });

});
