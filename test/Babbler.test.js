var assert = require('assert'),
    Babbler = require('../lib/Babbler'),
    ReplyNode = require('../lib/flow/ReplyNode'),
    DoNode = require('../lib/flow/DoNode'),
    DecisionNode = require('../lib/flow/DecisionNode');

describe('Babbler', function() {
  var emma, jack;

  beforeEach(function () {
    emma = new Babbler('emma');
    jack = new Babbler('jack');
  });

  afterEach(function () {
    // there shouldn't be any open conversations left
    assert.equal(Object.keys(emma.conversations).length, 0);
    assert.equal(Object.keys(jack.conversations).length, 0);

    emma.destroy();
    jack.destroy();

    emma = null;
    jack = null;
  });

  it('should create and destroy a babbler', function() {
    var susan = new Babbler('susan');
    assert.ok(susan instanceof Babbler);
    susan.destroy();
  });

  it('should throw an error when creating a babbler with wrong syntax', function() {
    assert.throws (function () {new Babbler(); });
    assert.throws (function () {Babbler('whoops'); });
  });

  describe ('listen', function () {

    it ('should listen to a message', function () {
      emma.listen('test', new ReplyNode(function () {}));

      assert.equal(Object.keys(emma.triggers).length, 1);
    });

    it ('should throw an error when calling listen wrongly', function () {
      assert.throws(function () {emma.listen({'a': 'not a string'}, new ReplyNode(function () {}))});
      assert.throws(function () {emma.listen('test', function () {})});
    });

  });

  describe ('tell', function () {
    
    it('should tell a message', function(done) {
      emma.listen('test', new DoNode(function (data) {
        assert.equal(data, null);
        done();
      }));

      jack.tell('emma', 'test');
    });

    it('should tell a message with data', function(done) {
      emma.listen('test', new DoNode(function (data) {
        assert.deepEqual(data, {a:2, b:3});
        done();
      }));

      jack.tell('emma', 'test', {a:2, b:3});
    });

  });

  describe ('ask', function () {

    it('should ask a question and reply', function(done) {
      emma.listen('add', new ReplyNode(function (data) {
        return data.a + data.b;
      }));

      jack.ask('emma', 'add', {a:2, b:3}, new DoNode(function (result) {
        assert.equal(result, 5);
        done();
      }));
    });

    it('should ask a question, reply, and reply on the reply', function(done) {
      emma.listen('count', new ReplyNode(function (count) {
        return count + 1;
      }, new DoNode(function (count) {
        assert.equal(count, 3);
        done();
      })));

      jack.ask('emma', 'count', 0, new ReplyNode(function (count) {
        assert.equal(count, 1);
        return count + 2;
      }));
    });

    it('should make a decision during a conversation', function(done) {
      emma.listen('are you available?', new ReplyNode(function (data  ) {
        assert.strictEqual(data, undefined);
        return 'yes';
      }));

      jack.ask('emma', 'are you available?', new DecisionNode(function (response) {
        assert.equal(response, 'yes');
        if (response == 'yes') {
          return new DoNode(function (response) {
            assert.equal(response, 'yes');
            done();
          });
        }
        else {
          return new DoNode(function (response) {
            // this shouldn't be reached
            assert.ok(false);
          });
        }
      }));
    });

  });

});
