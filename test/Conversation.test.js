var assert = require('assert');
var Promise = require('es6-promise').Promise;
var Conversation = require('../lib/Conversation');

describe('Conversation', function() {

  it('should create a conversation', function () {
    var send = function () {};
    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });

    assert(conversation instanceof Conversation);
    assert.strictEqual(conversation.id, 1);
    assert.strictEqual(conversation.self, 'peer1');
    assert.strictEqual(conversation.other, 'peer2');
    assert.strictEqual(conversation._send, send);
  });

  it('should throw an error when created without new operator', function () {
    assert.throws(function () {Conversation({})}, /new operator/);
  });

  it('should send a message', function (done) {
    var send = function (to, message) {
      assert.equal(to, 'peer2');
      assert.deepEqual(message, {
        'id': 1,
        'from': 'peer1',
        'to': 'peer2',
        'message': 'hi'
      });
      done();
    };

    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2',
      send: send
    });
    conversation.send('hi');
  });

  it('should wait for a message delivery', function () {
    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2'
    });

    var promise = conversation.receive().then(function (message) {
      assert.equal(message, 'hi');
    });

    assert.equal(conversation._receivers.length, 1);

    conversation.deliver({message: 'hi'});

    assert.equal(conversation._receivers.length, 0);

    return promise;
  });

  it('should wait for multiple message deliveries', function () {
    var log = [];
    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2'
    });

    var promise1 = conversation.receive().then(function (message) {
      assert.equal(message, 'foo');
      log.push(message);
    });

    var promise2 = conversation.receive().then(function (message) {
      assert.equal(message, 'bar');
      log.push(message);
    });

    assert.equal(conversation._receivers.length, 2);

    conversation.deliver({message: 'foo'});
    conversation.deliver({message: 'bar'});

    assert.equal(conversation._receivers.length, 0);

    return Promise.all([promise1, promise2])
        .then(function () {
          assert.equal(conversation._receivers.length, 0);
          assert.deepEqual(log, ['foo', 'bar'])
        });
  });

  it('should receive a message from the queue', function () {
    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2'
    });

    conversation.deliver({message: 'hi'});

    assert.deepEqual(conversation._inbox, ['hi']);

    return conversation.receive().then(function (message) {
      assert.equal(message, 'hi');

      assert.deepEqual(conversation._inbox, []);
    });
  });

  it('should receive multiple messages from the queue', function () {
    var conversation = new Conversation({
      id: 1,
      self: 'peer1',
      other: 'peer2'
    });

    conversation.deliver({message: 'hi'});
    conversation.deliver({message: 'there'});

    assert.deepEqual(conversation._inbox, ['hi', 'there']);

    return conversation.receive()
        .then(function (message) {
          assert.equal(message, 'hi');

          assert.deepEqual(conversation._inbox, ['there']);

          return conversation.receive();
        })
        .then(function (message) {
          assert.equal(message, 'there');

          assert.deepEqual(conversation._inbox, []);
        });
  });

});