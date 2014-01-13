var assert = require('assert'),
    Babbler = require('../lib/Babbler'),
    Block = require('../lib/block/Block'),
    Tell = require('../lib/block/Tell'),
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
      emma.listen('test');

      assert.equal(Object.keys(emma.listeners).length, 1);
    });

    it ('should throw an error when calling listen wrongly', function () {
      assert.throws(function () {emma.listen({'a': 'not a string'})});
      assert.throws(function () {emma.listen()});
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

    it.skip('should tell two messages subsequently', function(done) {
      emma.listen('foo')
          .listen(function (response) {
            assert.deepEqual(response, 'bar');
            done();
          });

      jack.tell('emma', 'foo').tell('bar');
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

    it ('should send a message, listen, and send a reply', function(done) {
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

    it ('should invoke the callback provided with listener', function(done) {
      emma.listen('what is you age?', function (response) {
        assert.equal(response, 'what is you age?');
        done();
      });

      jack.tell('emma', 'what is you age?');
    });

    it ('should invoke the callback provided with ask', function(done) {
      emma.listen('age')
          .tell(function () {
            return 32;
          });

      jack.ask('emma', 'age', function (response) {
        assert.equal(response, 32);
        done();
      });
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
            yes: new Action(function (response) {
              assert.equal(response, 'yes');
              done();
            })
          });
    });

    it('should run action nodes', function(done) {
      var logs = [];

      emma.listen('are you available?')
          .run(function (response) {
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
          .run(function () {
            logs.push('log 4');

            assert.deepEqual(logs, ['log 1', 'log 2', 'log 3', 'log 4']);

            done();
          });
    });

    it ('should keep state in the context during the conversation', function(done) {
      emma.listen('question', function () {
            return 'a';
          })
          .run(function (response, context) {
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
          .run(function (response, context) {
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
