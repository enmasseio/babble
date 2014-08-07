var assert = require('assert');
var Promise = require('es6-promise').Promise;
var Conversation = require('../../lib/Conversation');
var Block = require('../../lib/block/Block');
var IIf = require('../../lib/block/IIf');
var Then = require('../../lib/block/Then');

describe('IIf', function() {

  it('should create an iif without trueBlock and falseBlock', function () {
    var conversation = new Conversation();
    var condition = function (message, context) {
      assert.equal(message, 'message');
      assert.strictEqual(context, conversation.context);
      return true;
    };
    var iif = new IIf(condition);
    iif.then(function () {});

    assert.ok(iif instanceof IIf);


    return iif.execute(conversation, 'message').then(function (next) {
      assert.equal(next.result, 'message');
      assert.ok(next.block instanceof Then);
    });
  });

  it('should create an iif with trueBlock, falseBlock, and next block', function () {
    var conversation = new Conversation();
    var condition = function (message, context) {
      assert.strictEqual(context, conversation.context);
      return message === 'yes';
    };
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);
    iif.then(function () {});

    assert.ok(iif instanceof IIf);

    return iif.execute(conversation, 'yes')
        .then(function (next) {
          assert.equal(next.result, 'yes');
          assert.strictEqual(next.block, trueBlock);

          return iif.execute(conversation, 'no');
        })
        .then(function (next) {
          assert.equal(next.result, 'no');
          assert.strictEqual(next.block, falseBlock);
        });

  });

  it('should create an iif with a RegExp condition', function () {
    var conversation = new Conversation();
    var condition = /yes/;
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    return iif.execute(conversation, 'yes')
        .then(function (next) {
          assert.equal(next.result, 'yes');
          assert.strictEqual(next.block, trueBlock);

          return iif.execute(conversation, 'no');
        })
        .then(function (next) {
          assert.equal(next.result, 'no');
          assert.strictEqual(next.block, falseBlock);
        });
  });

  it('should create an iif with a string condition', function () {
    var conversation = new Conversation();
    var condition = 'yes';
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    return iif.execute(conversation, 'yes')
        .then(function (next) {
          assert.equal(next.result, 'yes');
          assert.strictEqual(next.block, trueBlock);

          return iif.execute(conversation, 'no');
        })
        .then(function (next) {
          assert.equal(next.result, 'no');
          assert.strictEqual(next.block, falseBlock);
        });
  });

  it('should create an iif with a condition returning a Promise', function () {
    var conversation = new Conversation();
    var condition = function (message) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(message == 'yes');
        }, 10)
      })
    };
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    return iif.execute(conversation, 'yes')
        .then(function (next) {
          assert.equal(next.result, 'yes');
          assert.strictEqual(next.block, trueBlock);

          return iif.execute(conversation, 'no');
        })
        .then(function (next) {
          assert.equal(next.result, 'no');
          assert.strictEqual(next.block, falseBlock);
        });
  });

  it('should create an iif with a number condition', function () {
    var conversation = new Conversation();
    var condition = 42;
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    return iif.execute(conversation, 42)
        .then(function (next) {
          assert.equal(next.result, 42);
          assert.strictEqual(next.block, trueBlock);

          return iif.execute(conversation, 12);
        })
        .then(function (next) {
          assert.equal(next.result, 12);
          assert.strictEqual(next.block, falseBlock);
        });
  });

  it('should throw an error on invalid input arguments', function () {
    assert.throws(function () {new IIf(function () {}, function () {});}, /trueBlock must be a Block/);
    assert.throws(function () {new IIf(function () {}, new Block(), function () {})}, /falseBlock must be a Block/);
  });

  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {IIf();});
  });

});
