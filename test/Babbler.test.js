var assert = require('assert'),
    Babbler = require('../lib/Babbler'),
    Reply = require('../lib/block/Reply'),
    Action = require('../lib/block/Action'),
    Decision = require('../lib/block/Decision');

describe('Babbler', function() {
  var emma, jack;

  beforeEach(function () {
    emma = new Babbler('emma').subscribe();
    jack = new Babbler('jack').subscribe();
  });

  afterEach(function () {
    // there shouldn't be any open conversations left
    assert.equal(Object.keys(emma.conversations).length, 0);
    assert.equal(Object.keys(jack.conversations).length, 0);

    emma.unsubscribe();
    jack.unsubscribe();

    emma = null;
    jack = null;
  });

  it('should create and destroy a babbler', function() {
    var susan = new Babbler('susan').subscribe();
    assert.ok(susan instanceof Babbler);
    susan.unsubscribe();
  });

  it('should throw an error when creating a babbler with wrong syntax', function() {
    assert.throws (function () {new Babbler(); });
    assert.throws (function () {Babbler('whoops'); });
  });

  describe ('listen', function () {

    it ('should listen to a message', function () {
      emma.listen('test', new Reply(function () {}));

      assert.equal(Object.keys(emma.triggers).length, 1);
    });

    it ('should throw an error when calling listen wrongly', function () {
      assert.throws(function () {emma.listen({'a': 'not a string'}, new Reply(function () {}))});
      assert.throws(function () {emma.listen('test', function () {})});
    });

  });

  describe ('tell', function () {
    
    it('should tell a message', function(done) {
      emma.listen('test', new Action(function (data) {
        assert.equal(data, null);
        done();
      }));

      jack.tell('emma', 'test');
    });

    it('should tell a message with data', function(done) {
      emma.listen('test', new Action(function (data) {
        assert.deepEqual(data, {a:2, b:3});
        done();
      }));

      jack.tell('emma', 'test', {a:2, b:3});
    });

  });

  describe ('ask', function () {

    it('should ask a question and reply', function(done) {
      emma.listen('add', new Reply(function (data) {
        return data.a + data.b;
      }));

      jack.ask('emma', 'add', {a:2, b:3}, new Action(function (result) {
        assert.equal(result, 5);
        done();
      }));
    });

    it('should ask a question, reply, and reply on the reply', function(done) {
      emma.listen('count', new Reply(function (count) {
        return count + 1;
      }, new Action(function (count) {
        assert.equal(count, 3);
        done();
      })));

      jack.ask('emma', 'count', 0, new Reply(function (count) {
        assert.equal(count, 1);
        return count + 2;
      }));
    });

    it('should make a decision during a conversation', function(done) {
      emma.listen('are you available?', new Reply(function (data  ) {
        assert.strictEqual(data, undefined);
        return 'yes';
      }));

      jack.ask('emma', 'are you available?', new Decision(function (response) {
        assert.equal(response, 'yes');
        if (response == 'yes') {
          return new Action(function (response) {
            assert.equal(response, 'yes');
            done();
          });
        }
      }));
    });

    it('should run action nodes', function(done) {
      var logs = [];

      emma.listen('are you available?', new Action(function (response) {
        logs.push('log 1');
      }, new Reply(function (response) {
        logs.push('log 2');
        assert.strictEqual(response, undefined);
        return 'yes';
      })));

      jack.ask('emma', 'are you available?', new Action(function (response) {
        assert.equal(response, 'yes');
        logs.push('log 3');
      }, new Action(function () {
        logs.push('log 4');

        assert.deepEqual(logs, ['log 1', 'log 2', 'log 3', 'log 4']);

        done();
      })));
    });

  });

});
