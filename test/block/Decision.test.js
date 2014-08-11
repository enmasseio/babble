var assert = require('assert');
var Promise = require('es6-promise').Promise;
var Conversation = require('../../lib/Conversation');
var Block = require('../../lib/block/Block');
var Decision = require('../../lib/block/Decision');

describe('Decision', function() {

  it('should create a decision', function () {
    var decision1 = new Decision(function () {}, {});
    assert.ok(decision1 instanceof Decision);

    var decision2 = new Decision({
      yes: new Block(),
      no: new Block()
    });
    assert.ok(decision2 instanceof Decision);
    assert.deepEqual(decision2.choices, {
      yes: new Block(),
      no: new Block()
    });
  });

  it('should add choices to a decision', function () {
    var decision = new Decision();
    assert.deepEqual(decision.choices, {});
    decision.addChoice('yes', new Block());
    decision.addChoice('no', new Block());

    assert.deepEqual(decision.choices, {
      yes: new Block(),
      no: new Block()
    });
  });

  it('should throw an error when adding invalid choices to a decision', function () {
    var decision = new Decision();
    assert.deepEqual(decision.choices, {});

    assert.throws(function () {
      decision.addChoice();
    });
    assert.throws(function () {
      decision.addChoice(123, new Block());
    });
    assert.throws(function () {
      decision.addChoice('id', function() {});
    });
  });

  it('should throw an error when wrongly creating a decision', function () {
    assert.throws(function () { Decision({
      yes: new Block(),
      no: 'no block'
    })}, SyntaxError);
    assert.throws(function () { Decision('no function', {}) }, SyntaxError);
  });

  it('should throw an error when no matching choice', function () {
    var decision = new Decision(function () {
      return 'non existing id'
    }, {
      yes: new Block(),
      no: new Block()
    });

    var conversation = new Conversation();
    return decision.execute(conversation)
        .then(function (next) {
          assert.ok(false, 'should not succeed')
        })
        .catch(function (err) {
          assert.equal(err.toString(), 'Error: Block with id "non existing id" not found');
        })
  });

  it('should fallback to default when no matching choice', function () {
    var def = new Block();
    var decision = new Decision(function () {
      return 'non existing id'
    }, {
      yes: new Block(),
      no: new Block(),
      'default': def
    });

    var conversation = new Conversation();
    return decision.execute(conversation)
        .then(function (next) {
          assert.strictEqual(next.result, undefined);
          assert.strictEqual(next.block, def);
        });
  });

  it('should execute a decision without decision function', function () {
    var yes = new Block();
    var no = new Block();
    var decision = new Decision({
      yes: yes,
      no: no
    });

    var conversation = new Conversation();
    return decision.execute(conversation, 'yes').then(function (next) {
      assert.deepEqual(next, {
        result: 'yes',
        block: yes
      })
    })
  });

  it('should execute a decision function returning a Promise', function () {
    var yes = new Block();
    var no = new Block();
    var fn = function () {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve('yes');
        }, 10);
      });
    };
    var decision = new Decision(fn, {
      yes: yes,
      no: no
    });

    var conversation = new Conversation();
    return decision.execute(conversation, 'yes').then(function (next) {
      assert.deepEqual(next, {
        result: 'yes',
        block: yes
      })
    })
  });

  it('should execute a decision with context', function () {
    var yes = new Block();
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'message');
      assert.deepEqual(context, {a: 2});
      return 'yes';
    }, {
      yes: yes
    });

    var conversation = new Conversation({
      context: {a: 2}
    });
    return decision.execute(conversation, 'message').then(function (next) {
      assert.deepEqual(next, {
        result: 'message',
        block: yes
      })
    });
  });

  it('should execute a decision with context and argument', function () {
    var yes = new Block();
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'yes';
    }, {
      yes: yes
    });

    var conversation = new Conversation({
      context: {a: 2}
    });
    return decision.execute(conversation, 'hello world').then(function (next) {
      assert.deepEqual(next, {
        result: 'hello world',
        block: yes
      })
    });
  });

});
