var assert = require('assert'),
    Babbler = require('../lib/Babbler');

describe('Babbler', function() {
  // TODO: have an instantiated pub/sub solution

  it('should create a babbler', function() {
    var emma = new Babbler('emma0');
    assert.ok(emma instanceof Babbler);
  });

  it('should throw an error when creating a babbler with wrong syntax', function() {
    assert.throws (function () {new Babbler(); });
    assert.throws (function () {Babbler('whoops'); });
  });

  describe ('tell', function () {

    it('should tell a message', function(done) {
      var emma = new Babbler('emma1');
      var jack = new Babbler('jack1');

      emma.listen('test', function (data) {
        assert.equal(data, null);
        done();
      });

      jack.tell('emma1', 'test');
    });

    it('should tell a message with data', function(done) {
      var emma = new Babbler('emma2');
      var jack = new Babbler('jack2');

      emma.listen('test', function (data) {
        assert.deepEqual(data, {a:2, b:3});
        done();
      });

      jack.tell('emma2', 'test', {a:2, b:3});
    });

  });

  describe ('ask', function () {

    it('should ask a question and reply', function(done) {
      var emma = new Babbler('emma1');
      var jack = new Babbler('jack1');

      emma.listen('add', function (data) {
        this.reply(data.a + data.b);
      });

      jack.ask('emma1', 'add', {a:2, b:3}, function (result) {
        assert.equal(result, 5);
        done();
      });
    });

    it('should ask a question, reply, and reply on the reply', function(done) {
      var emma = new Babbler('emma1');
      var jack = new Babbler('jack1');

      emma.listen('count', function (count) {
        this.reply(count + 1, function (count) {
          assert.equal(count, 3);
          done();
        });
      });

      jack.ask('emma1', 'count', 0, function (count) {
        assert.equal(count, 1);
        this.reply(count + 2);
      });
    });

  });

});
