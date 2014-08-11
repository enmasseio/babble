var assert = require('assert');
var Promise = require('es6-promise').Promise;
var Conversation = require('../../lib/Conversation');
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

  it('should execute a listener', function () {
    var listener = new Listen();

    var conversation = new Conversation();
    conversation.deliver({message: 'foo'});

    return listener.execute(conversation).then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      })
    });
  });

  it('should execute a listener with delay in receiving a message', function () {
    var listener = new Listen();

    var conversation = new Conversation();
    setTimeout(function () {
      conversation.deliver({message: 'foo'});
    }, 10);

    return listener.execute(conversation).then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      })
    });
  });

  it('should execute a listener with next block', function () {
    var listener = new Listen();
    var nextListener = new Listen ();
    listener.then(nextListener);


    var conversation = new Conversation();
    conversation.deliver({message: 'foo'});

    return listener.execute(conversation).then(function(next) {
      assert.strictEqual(next.result, 'foo');
      assert.strictEqual(next.block, nextListener);
    });
  });

  it('should create a listen+iif block from function .listen', function () {
    var block = new Block();
    var callback = function (message) {
      return message + 'bar';
    };
    var b = block.listen(callback);

    var listen = block.next;
    var then = listen.next;

    assert.strictEqual(b, then);
    assert(listen instanceof Listen);
    assert(then instanceof Then);
    assert.strictEqual(then.next, undefined); // TODO: should be null

    var conversation = new Conversation();
    conversation.deliver({message: 'foo'});

    return block.next.execute(conversation).then(function(next) {
      assert(next.block instanceof Then);
      assert.strictEqual(next.result, 'foo');

      return next.block.execute(conversation, next.result);
    }).then(function(next) {
      assert.equal(next.block, null);
      assert.strictEqual(next.result, 'foobar');
    });
  });

});
