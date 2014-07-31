var assert = require('assert');
var Tell = require('../../lib/block/Tell');

describe('Tell', function() {

  it('should create a tell', function () {
    var tell1 = new Tell();
    assert.ok(tell1 instanceof Tell);

    var tell2 = new Tell(function () {});
    assert.ok(tell2 instanceof Tell);
  });

  it('should throw an error when wrongly creating a tell', function () {
    assert.throws(function () { Tell(function () {}) }, SyntaxError);
    assert.throws(function () { new Tell('hello')}, TypeError);
  });

  it('should execute a tell without arguments', function () {
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, undefined);
      return 'foo';
    });

    var next = tell.execute();
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a tell with context', function () {
    var context = {a: 2};
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
      return 'foo';
    });

    var next = tell.execute(undefined, context);
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a tell with context and argument', function () {
    var context = {a: 2};
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'foo'
    });

    var next = tell.execute('hello world', context);
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should execute a tell with next block', function () {
    var tell = new Tell(function () {return 'foo'});
    var nextTell = new Tell (function () {return 'foo'});
    tell.then(nextTell);

    var next = tell.execute();
    assert.strictEqual(next.result, 'foo');
    assert.strictEqual(next.block, nextTell);
  });

  it('should pass the result from and to callback when executing', function () {
    var action = new Tell(function (response, context) {
      assert.equal(response, 'in');
      return 'out';
    });

    var next = action.execute('in');
    assert.strictEqual(next.result, 'out');
    assert.strictEqual(next.block, undefined);
  });

});
