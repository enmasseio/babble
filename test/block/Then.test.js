var assert = require('assert');
var Conversation = require('../../lib/Conversation');
var Then = require('../../lib/block/Then');

describe('Then', function() {

  it('should create a Then block', function () {
    var action1 = new Then(function () {});
    assert.ok(action1 instanceof Then);
  });

  it('should throw an error when wrongly creating a Then block', function () {
    assert.throws(function () { Then(function () {}) }, SyntaxError);
    assert.throws(function () { new Then()}, TypeError);
    assert.throws(function () { new Then('bla')}, TypeError);
  });

  it('should execute a Then block without message', function () {
    var action = new Then(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, conversation.context);
    });

    var conversation = new Conversation();
    return action.execute(conversation).then(function(next) {
      assert.deepEqual(next, {
        result: undefined,
        block: undefined
      })
    });
  });

  it('should execute a Then block with context', function () {
    var conversation = new Conversation({
      context: {a: 2}
    });
    var action = new Then(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
    });

    return action.execute(conversation, undefined).then(function(next) {
      assert.deepEqual(next, {
        result: undefined,
        block: undefined
      })
    });
  });

  it('should execute a Then block with context and argument', function () {
    var conversation = new Conversation({
      context: {a: 2}
    });
    var action = new Then(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
    });

    return action.execute(conversation, 'hello world').then(function(next) {
      assert.deepEqual(next, {
        result: undefined,
        block: undefined
      })
    });
  });

  it('should execute a Then block with next block', function () {
    var action = new Then(function () {});
    var nextThen = new Then (function () {});
    action.then(nextThen);

    var conversation = new Conversation();
    return action.execute(conversation).then(function(next) {
      assert.strictEqual(next.result, undefined);
      assert.strictEqual(next.block, nextThen);
    });
  });

  it('should pass the result from and to callback when executing', function () {
    var action = new Then(function (response, context) {
      assert.equal(response, 'in');
      return 'out';
    });

    var conversation = new Conversation();
    return action.execute(conversation, 'in').then(function(next) {
      assert.strictEqual(next.result, 'out');
      assert.strictEqual(next.block, undefined);
    });
  });

});
