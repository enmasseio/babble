var assert = require('assert'),
    Decision = require('../../lib/block/Decision');

describe('Decision', function() {

  it('should create a decision', function () {
    var decision1 = new Decision(function () {});
    assert.ok(decision1 instanceof Decision);
  });

  it('should throw an error when wrongly creating a decision', function () {
    assert.throws(function () { Decision(function () {}) }, SyntaxError);
    assert.throws(function () { Decision(function () {}, new Decision(function() {})) }, SyntaxError);
    assert.throws(function () { new Decision()}, TypeError);
    assert.throws(function () { new Decision('bla')}, TypeError);
  });

  it('should execute a decision without arguments', function () {
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, undefined);
    });

    var next = decision.execute();
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute a decision with context', function () {
    var context = {a: 2};
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
    });

    var next = decision.execute(context);
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute a decision with context and argument', function () {
    var context = {a: 2};
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
    });

    var next = decision.execute(context, 'hello world');
    assert.deepEqual(next, {
      result: undefined,
      block: undefined
    })
  });

  it('should execute a decision with next block', function () {
    var decision2 = new Decision (function () {});
    var decision1 = new Decision(function () {
      return decision2;
    });

    var next = decision1.execute();
    assert.strictEqual(next.result, undefined);
    assert.strictEqual(next.block, decision2);
  });

  it('should throw an error when callback doesn\'t return a Block', function () {
    var decision = new Decision(function (response, context) {
      return 'oops';
    });

    assert.throws(function () {decision.execute();}, TypeError);
  });

});
