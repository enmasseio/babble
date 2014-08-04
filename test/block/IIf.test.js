var assert = require('assert');
var Block = require('../../lib/block/Block');
var IIf = require('../../lib/block/IIf');
var Then = require('../../lib/block/Then');

describe('IIf', function() {

  it('should create an iif without trueBlock and falseBlock', function () {
    var c = {};
    var condition = function (message, context) {
      assert.equal(message, 'message');
      assert.strictEqual(context, c);
      return true;
    };
    var iif = new IIf(condition);
    iif.then(function () {});

    assert.ok(iif instanceof IIf);


    var next = iif.execute('message', c);
    assert.equal(next.result, 'message');
    assert.ok(next.block instanceof Then);
  });

  it('should create an iif with trueBlock, falseBlock, and next block', function () {
    var c = {};
    var condition = function (message, context) {
      assert.strictEqual(context, c);
      return message === 'yes';
    };
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);
    iif.then(function () {});

    assert.ok(iif instanceof IIf);

    var next = iif.execute('yes', c);
    assert.equal(next.result, 'yes');
    assert.strictEqual(next.block, trueBlock);

    next = iif.execute('no', c);
    assert.equal(next.result, 'no');
    assert.strictEqual(next.block, falseBlock);
  });

  it('should create an iif with a RegExp condition', function () {
    var c = {};
    var condition = /yes/;
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    var next = iif.execute('yes', c);
    assert.equal(next.result, 'yes');
    assert.strictEqual(next.block, trueBlock);

    next = iif.execute('no', c);
    assert.equal(next.result, 'no');
    assert.strictEqual(next.block, falseBlock);
  });

  it('should create an iif with a string condition', function () {
    var c = {};
    var condition = 'yes';
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    var next = iif.execute('yes', c);
    assert.equal(next.result, 'yes');
    assert.strictEqual(next.block, trueBlock);

    next = iif.execute('no', c);
    assert.equal(next.result, 'no');
    assert.strictEqual(next.block, falseBlock);
  });

  it('should create an iif with a number condition', function () {
    var c = {};
    var condition = 42;
    var trueBlock = new Then(function () {});
    var falseBlock = new Then(function () {});
    var iif = new IIf(condition, trueBlock, falseBlock);

    assert.ok(iif instanceof IIf);

    var next = iif.execute(42, c);
    assert.equal(next.result, 42);
    assert.strictEqual(next.block, trueBlock);

    next = iif.execute(12, c);
    assert.equal(next.result, 12);
    assert.strictEqual(next.block, falseBlock);
  });

  it('should throw an error on invalid input arguments', function () {
    assert.throws(function () {new IIf(function () {}, function () {});}, /trueBlock must be a Block/);
    assert.throws(function () {new IIf(function () {}, new Block(), function () {})}, /falseBlock must be a Block/);
  });

  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {IIf();});
  });

});
