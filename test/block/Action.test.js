var assert = require('assert'),
    Action = require('../../lib/block/Action');

describe('Action', function() {

  it('should create an action', function () {
    var action1 = new Action(function () {});
    assert.ok(action1 instanceof Action);

    var action2 = new Action(function () {}, new Action(function () {}));
    assert.ok(action2 instanceof Action);
  });

  it('should throw an error when wrongly creating an action', function () {
    assert.throws(function () { Action(function () {}) }, SyntaxError);
    assert.throws(function () { new Action()}, TypeError);
    assert.throws(function () { new Action('bla')}, TypeError);
    assert.throws(function () { new Action(function () {}, 'bla')}, TypeError);
  });

  it('should execute an action without arguments', function () {
    var action = new Action(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, undefined);
    });

    var next = action.execute();
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute an action with context', function () {
    var context = {a: 2};
    var action = new Action(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
    });

    var next = action.execute(context);
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute an action with context and argument', function () {
    var context = {a: 2};
    var action = new Action(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
    });

    var next = action.execute(context, 'hello world');
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute an action with next block', function () {
    var nextAction = new Action (function () {});
    var action = new Action(function () {}, nextAction);

    var next = action.execute();
    assert.strictEqual(next.result, undefined);
    assert.strictEqual(next.block, nextAction);
  });

  it('should throw an error when callback returns a result', function () {
    var action = new Action(function (response, context) {
      return 'oops';
    });

    assert.throws(function () {action.execute();});
  });

});
