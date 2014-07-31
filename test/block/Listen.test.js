var assert = require('assert');
var Listen = require('../../lib/block/Listen');

describe('Listen', function() {

  it('should create a listener', function () {
    var listener1 = new Listen();
    assert.ok(listener1 instanceof Listen);

    var listener2 = new Listen(function () {});
    assert.ok(listener2 instanceof Listen);
  });

  it('should throw an error when wrongly creating a listener', function () {
    assert.throws(function () { Listen(function () {}) }, SyntaxError);
    assert.throws(function () { new Listen('bla')}, TypeError);
  });

  it('should execute a listener without arguments', function () {
    var listener = new Listen(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, undefined);
      return 'foo';
    });

    var next = listener.execute();
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a listener with context', function () {
    var context = {a: 2};
    var listener = new Listen(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
      return 'foo';
    });

    var next = listener.execute(undefined, context);
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a listener with context and argument', function () {
    var context = {a: 2};
    var listener = new Listen(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'foo'
    });

    var next = listener.execute('hello world', context);
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a listener with next block', function () {
    var listener = new Listen(function () {return 'foo'});
    var nextListener = new Listen (function () {return 'foo'});
    listener.then(nextListener);

    var next = listener.execute();
    assert.strictEqual(next.result, 'foo');
    assert.strictEqual(next.block, nextListener);
  });

  it('should pass the result from and to callback when executing', function () {
    var action = new Listen(function (response, context) {
      assert.equal(response, 'in');
      return 'out';
    });

    var next = action.execute('in');
    assert.strictEqual(next.result, 'out');
    assert.strictEqual(next.block, undefined);
  });

});
