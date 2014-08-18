var assert = require('assert');
var Babbler = require('../lib/Babbler');
var Block = require('../lib/block/Block');
var Tell = require('../lib/block/Tell');
var Then = require('../lib/block/Then');
var Decision = require('../lib/block/Decision');

describe('Babbler', function() {
  var emma, jack;

  beforeEach(function () {
    emma = new Babbler('emma');
    jack = new Babbler('jack');

    emma.connect();
    jack.connect();
  });

  afterEach(function () {
    // there shouldn't be any open conversations left
    assert.equal(Object.keys(emma.conversations).length, 0);
    assert.equal(Object.keys(jack.conversations).length, 0);

    emma.disconnect();
    jack.disconnect();

    emma = null;
    jack = null;
  });

  it('should create and destroy a babbler', function() {
    new Babbler('susan').connect()
        .then(function (susan) {
          assert.ok(susan instanceof Babbler);
          susan.disconnect();
        });
  });

  it('should throw an error when creating a babbler with wrong syntax', function() {
    assert.throws (function () {new Babbler(); });
    assert.throws (function () {Babbler('whoops'); });
  });

  describe ('listen', function () {

    it ('should listen to a message', function (done) {
      emma.listen('test', function (response) {
        assert.equal(response, 'test');
        assert.equal(Object.keys(emma.listeners).length, 1);
        done();
      });

      assert.equal(Object.keys(emma.listeners).length, 1);

      emma._receive({
        id: '1',
        from: 'jack',
        to: 'emma',
        message: 'test'
      });
    });

    it ('should listen to a message once', function (done) {
      emma.listenOnce('test', function (response) {
        try {
          assert.equal(response, 'test');
          assert.equal(Object.keys(emma.listeners).length, 0);
          done();
        }
        catch(err) {
          done(err);
        }
      });

      assert.equal(Object.keys(emma.listeners).length, 1);

      emma._receive({
        id: '1',
        from: 'jack',
        to: 'emma',
        message: 'test'
      });
    });

  });

  describe ('tell', function () {
    
    it('should tell a message', function(done) {
      emma.listen('test', function (response) {
            assert.equal(response, 'test');
            done();
          });

      jack.tell('emma', 'test');
    });

    it('should tell a function as message', function(done) {
      emma.listen('test', function (response) {
            assert.equal(response, 'test');
            done();
          });

      jack.tell('emma', function () {
        return 'test';
      });
    });

    it('should tell two messages subsequently', function(done) {
      emma.listen('foo')
          .listen(function (response) {
            assert.deepEqual(response, 'bar');
            done();
          });

      jack.tell('emma', 'foo')
          .tell('bar');
    });

    it('should chain some blocks to a Tell block', function(done) {
      emma.listen('foo')
          .listen(function (response) {
            assert.equal(response, 'bar');
          })
          .tell('bye');

      jack.tell('emma', 'foo')
          .then(function (response) {
            assert.equal(response, 'foo');
            return 'bar';
          })
          .tell(function (response) {
            return response;
          })
          .listen(function (response) {
            assert.equal(response, 'bye');
            done();
          });
    });

  });

  describe ('ask', function () {

    it('should send a message and listen for a reply', function(done) {
      emma.listen('what is your name?')
          .tell(function (message) {
            return 'emma';
          });

      jack.ask('emma', 'what is your name?', function (result) {
            assert.equal(result, 'emma');
            done();
          });
    });

    it('should send a message, listen, and send a reply', function(done) {
      emma.listen('count', function () {
            return 0;
          })
          .tell(function (count) {
            return count + 1;
          })
          .listen(function (count) {
            assert.equal(count, 3);
            done();
          });

      jack.ask('emma', 'count')
          .tell(function (count) {
            return count + 2;
          });
    });

    it('should send an object as reply', function(done) {
      emma.listen('test')
          .tell(function (response) {
            return {a: 2, b: 3}
          });

      jack.ask('emma', 'test', function (response) {
        assert.deepEqual(response, {a: 2, b: 3});
        done();
      });
    });

    it('should send an object as reply (2)', function(done) {
      emma.listen('test')
          .tell({a: 2, b: 3});

      jack.ask('emma', 'test', function (response) {
        assert.deepEqual(response, {a: 2, b: 3});
        done();
      });
    });

    it('should invoke the callback provided with listener', function(done) {
      emma.listen('what is you age?', function (response) {
        assert.equal(response, 'what is you age?');
        done();
      });

      jack.tell('emma', 'what is you age?');
    });

    it('should invoke the callback provided with ask', function(done) {
      emma.listen('age')
          .tell(function () {
            return 32;
          });

      jack.ask('emma', 'age', function (response) {
        assert.equal(response, 32);
        done();
      });
    });

    it('should invoke an ask in a chain', function(done) {
      emma.listen('hi')
          .ask('what is your age?', function (response) {
            assert.equal(response, 32);
            setTimeout(done, 0);
          });

      jack.tell('emma', 'hi')
          .listen(function (response) {
            assert.equal(response, 'what is your age?');
          })
          .tell(32);
    });

    it('should make a decision during a conversation', function(done) {
      emma.listen('are you available?')
          .tell(function (response) {
            return 'yes';
          });

      jack.ask('emma', 'are you available?')
          .decide(function (response) {
            assert.equal(response, 'yes');
            return response;
          }, {
            yes: new Then(function (response) {
              assert.equal(response, 'yes');
              done();
            })
          });
    });

    it('should make a decision with an iif block', function(done) {
      emma.listen('are you available?')
          .tell(function (response) {
            return 'yes';
          });

      jack.ask('emma', 'are you available?')
          .iif('yes', new Then(function (message) {
            assert.equal(message, 'yes');
            done();
          }), new Then(function (message) {
            assert.ok(false, 'should not execute falseBlock')
          }));
    });

    it('should make a decision with an inline iif block', function(done) {
      emma.listen('are you available?')
          .tell(function (response) {
            return 'yes';
          });

      jack.ask('emma', 'are you available?')
          .iif('yes')
          .then(function (message) {
            assert.equal(message, 'yes');
            done();
          });
    });

    it('should run then blocks', function(done) {
      var logs = [];

      emma.listen('are you available?')
          .then(function (response) {
            logs.push('log 1');
          })
          .tell(function (response) {
            logs.push('log 2');
            assert.strictEqual(response, undefined);
            return 'yes';
          });

      jack.ask('emma', 'are you available?', function (response) {
            assert.equal(response, 'yes');
            logs.push('log 3');
          })
          .then(function () {
            logs.push('log 4');

            assert.deepEqual(logs, ['log 1', 'log 2', 'log 3', 'log 4']);

            done();
          });
    });

    it('should keep state in the context during the conversation', function(done) {
      emma.listen('question', function () {
            return 'a';
          })
          .then(function (response, context) {
            context.a = 1;
            return response;
          })
          .decide(function (response, context) {
            context.b = 2;
            assert.equal(context.a, 1);

            return 'first';
          }, {
            first: new Tell(function (response, context) {
                  assert.equal(response, 'a');
                  assert.equal(context.a, 1);
                  assert.equal(context.b, 2);
                  context.c = 3;

                  return 'b';
                })
                .listen(function (response, context) {
                  assert.equal(response, 'c');
                  assert.equal(context.a, 1);
                  assert.equal(context.b, 2);
                  assert.equal(context.c, 3);
                  done();
                })
          });

      jack.ask('emma', 'question')
          .then(function (response, context) {
            context.a = 1;
            return response;
          })
          .tell(function (response, context) {
            assert.equal(response, 'b');
            assert.equal(context.a, 1);

            return 'c';
          });
    });

  });

});
