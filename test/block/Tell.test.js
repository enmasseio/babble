var assert = require('assert');
var Promise = require('es6-promise').Promise;
var Conversation = require('../../lib/Conversation');
var Tell = require('../../lib/block/Tell');

describe('Tell', function() {

  var sent = [];
  var send = function (from, message) {
    sent.push([from, message]);
    return Promise.resolve();
  };

  beforeEach(function () {
    sent = [];
  });

  it('should create a tell', function () {
    var tell1 = new Tell();
    assert.ok(tell1 instanceof Tell);

    var tell2 = new Tell(function () {});
    assert.ok(tell2 instanceof Tell);
  });

  it('should throw an error when wrongly creating a tell', function () {
    assert.throws(function () { Tell(function () {}) }, SyntaxError);
  });

  it('should execute a tell with static message', function () {
    var tell = new Tell('foo');

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    return tell.execute(conversation).then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      });
      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with callback function', function () {
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, 'bar');
      assert.strictEqual(context, conversation.context);
      return 'foo';
    });

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    return tell.execute(conversation, 'bar').then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      });
      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with callback function returning a Promise', function () {
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.strictEqual(context, conversation.context);
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve('foo');
        }, 10)
      });
    });

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    return tell.execute(conversation).then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      });
      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with context', function () {
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, undefined);
      assert.deepEqual(context, {a: 2});
      return 'foo';
    });

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send,
      context: {a: 2}
    });
    return tell.execute(conversation, undefined).then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      });
      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with context and argument', function () {
    var tell = new Tell(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'foo'
    });

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send,
      context: {a: 2}
    });
    return tell.execute(conversation, 'hello world').then(function(next) {
      assert.deepEqual(next, {
        result: 'foo',
        block: undefined
      });
      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with next block', function () {
    var tell = new Tell(function () {return 'foo'});
    var nextTell = new Tell (function () {return 'foo'});
    tell.then(nextTell);

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    return tell.execute(conversation).then(function(next) {
      assert.strictEqual(next.result, 'foo');
      assert.strictEqual(next.block, nextTell);

      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should execute a tell with an async send method', function () {
    var action = new Tell('foo');

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: function (from, message) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            sent.push([from, message]);
            resolve();
          }, 10);
        });
      }
    });

    return action.execute(conversation, 'in').then(function(next) {
      assert.strictEqual(next.result, 'foo');
      assert.strictEqual(next.block, undefined);

      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'foo'}]]);
    });
  });

  it('should pass the result from and to callback when executing', function () {
    var action = new Tell(function (response, context) {
      assert.equal(response, 'in');
      return 'out';
    });

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    return action.execute(conversation, 'in').then(function(next) {
      assert.strictEqual(next.result, 'out');
      assert.strictEqual(next.block, undefined);

      assert.deepEqual(sent, [['peer2', {id:1, from: 'peer1', to: 'peer2', message: 'out'}]]);
    });
  });

});
