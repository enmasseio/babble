var assert = require('assert'),
    Reply = require('../../lib/block/Reply');

describe('Reply', function() {

  it('should create a reply', function () {
    var reply1 = new Reply(function () {});
    assert.ok(reply1 instanceof Reply);

    var reply2 = new Reply(function () {}, new Reply(function () {}));
    assert.ok(reply2 instanceof Reply);
  });

  it('should throw an error when wrongly creating a reply', function () {
    assert.throws(function () { Reply(function () {}) }, SyntaxError);
    assert.throws(function () { new Reply()}, TypeError);
    assert.throws(function () { new Reply('bla')}, TypeError);
    assert.throws(function () { new Reply(function () {}, 'bla')}, TypeError);
  });

  it('should run a reply without arguments', function () {
    var reply = new Reply(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, undefined);
      return 'foo';
    });

    var next = reply.run();
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should run a reply with context', function () {
    var context = {a: 2};
    var reply = new Reply(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
      return 'foo';
    });

    var next = reply.run(context);
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should run a reply with context and argument', function () {
    var context = {a: 2};
    var reply = new Reply(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'foo'
    });

    var next = reply.run(context, 'hello world');
    assert.deepEqual(next, {
      result: 'foo',
      block: undefined
    })
  });

  it('should run a reply with next block', function () {
    var nextAction = new Reply (function () {return 'foo'});
    var reply = new Reply(function () {return 'foo'}, nextAction);

    var next = reply.run();
    assert.strictEqual(next.result, 'foo');
    assert.strictEqual(next.block, nextAction);
  });

  it('should throw an error when callback does not return a result', function () {
    var reply = new Reply(function (response, context) {
      return undefined;
    });

    assert.throws(function () {reply.run();});
  });

});
