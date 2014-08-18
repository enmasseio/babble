var assert = require('assert');
var babble = require('../index');
var Babbler = require('../lib/Babbler');

var Tell = require('../lib/block/Tell');
var Listen = require('../lib/block/Listen');
var Decision = require('../lib/block/Decision');
var IIf = require('../lib/block/IIf');
var Then = require('../lib/block/Then');

describe('babble', function() {

  it('should create a babbler', function() {
    var emma = babble.babbler('emma0');
    assert.ok(emma instanceof Babbler);
  });

  it('should throw an error when creating a Babbler without id', function() {
    assert.throws(function () {babble.babbler(); });
  });

  it('should create a flow starting with a tell block', function() {
    var block = babble.tell(function () {});
    assert.ok(block instanceof Tell);
  });

  it('should create a flow starting with ask', function() {
    var block = babble.ask('what is your name');
    assert.ok(block instanceof Listen);
    assert.ok(block.previous instanceof Tell);
  });

  it('should create a flow starting with listen', function() {
    var block = babble.listen();
    assert.ok(block instanceof Listen);
  });

  it('should create a flow starting with a decision block', function() {
    var block = babble.decide(function () {}, {});
    assert.ok(block instanceof Decision);
  });

  it('should create a flow starting with an iif block', function() {
    var block = babble.iif(function () {});
    assert.ok(block instanceof IIf);
  });

  it('should create a flow starting with a Then block', function() {
    var block = babble.then(function () {});
    assert.ok(block instanceof Then);
  });

  describe('babblify', function() {

    // create a simple actor system
    function Actor(id) {
      this.id = id;
      Actor.actors[id] = this;
    }
    Actor.actors = {}; // map with all actors by their id
    Actor.prototype.send = function (to, message) {
      var actor = Actor.actors[to];
      if (!actor) {
        throw new Error('Not found');
      }
      actor.receive(this.id, message);
    };
    Actor.prototype.receive = function (from, message) {
      // ... to be overwritten by the actor
    };

    beforeEach(function () {
      Actor.actors = {};
    });

    it('should babblify an object', function() {
      var actor1 = babble.babblify(new Actor('actor1'));

      assert.equal(typeof actor1.ask, 'function');
      assert.equal(typeof actor1.tell, 'function');
      assert.equal(typeof actor1.listen, 'function');
    });

    it('should have a conversation with babblified objects', function(done) {
      var actor1 = babble.babblify(new Actor('actor1'));
      var actor2 = babble.babblify(new Actor('actor2'));

      actor1.listen('test')
          .tell(function () {
            return 'hi';
          });

      actor2.ask('actor1', 'test')
          .then(function (response, context) {
            assert.equal(response, 'hi');

            done();
          });
    });

    it('should create babblified objects with custom functions', function(done) {
      // create a simple actor system
      function Actor2(id) {
        this.id = id;
        Actor2.actors[id] = this;
      }
      Actor2.actors = {}; // map with all actors by their id
      Actor2.prototype.sendIt = function (to, message) {
        var actor = Actor2.actors[to];
        if (!actor) {
          throw new Error('Not found');
        }
        actor.receiveIt(this.id, message);
      };
      Actor2.prototype.receiveIt = function (from, message) {
        // ... to be overwritten by the actor
      };

      var actor1 = babble.babblify(new Actor2('actor1'), {send: 'sendIt', receive: 'receiveIt'});
      var actor2 = babble.babblify(new Actor2('actor2'), {send: 'sendIt', receive: 'receiveIt'});

      actor1.listen('test')
          .tell(function () {
            return 'hi';
          });

      actor2.ask('actor1', 'test')
          .then(function (response, context) {
            assert.equal(response, 'hi');

            done();
          });
    });

    it('should unbabblify a babblified object', function() {
      var orig = new Actor('actor1');

      // copy the original properties
      var original = {};
      Object.keys(orig).forEach(function (prop) {
        original[prop] = orig[prop];
      });

      var babblified = babble.babblify(orig);
      var unbabblified = babble.unbabblify(babblified);

      // compare the properties
      assert.deepEqual(Object.keys(original), Object.keys(unbabblified));
      Object.keys(unbabblified).forEach(function (prop) {
        assert.strictEqual(unbabblified[prop], original[prop]);
        assert.strictEqual(orig[prop], original[prop]);
      });
    });

  });

});
