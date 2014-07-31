var assert = require('assert');
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

  it('should throw an error when decision function returns a non existing id', function () {
    assert.throws(function () {
      Decision(function () {
        return 'non existing id'
      }, {
        yes: new Block(),
        no: new Block()
      })
    }, Error);
  });

  it('should throw an error when decision function doesn\'t return a string', function () {
    assert.throws(function () {
      var decision = new Decision(function () {
        return 123
      }, {});
      decision.execute();
    }, TypeError);
  });

  it('should execute a decision without decision function', function () {
    var yes = new Block();
    var no = new Block();
    var decision = new Decision({
      yes: yes,
      no: no
    });

    var context = {};
    var next = decision.execute('yes', context);
    assert.deepEqual(next, {
      result: 'yes',
      block: yes
    })
  });

  it('should execute a decision without arguments', function () {
    var yes = new Block();
    var no = new Block();
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'message');
      assert.strictEqual(context, undefined);
      return 'yes';
    }, {
      yes: yes,
      no: no
    });

    var next = decision.execute('message');
    assert.deepEqual(next, {
      result: 'message',
      block: yes
    })
  });

  it('should execute a decision with context', function () {
    var yes = new Block();
    var context = {a: 2};
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'message');
      assert.deepEqual(context, {a: 2});
      return 'yes';
    }, {
      yes: yes
    });

    var next = decision.execute('message', context);
    assert.deepEqual(next, {
      result: 'message',
      block: yes
    })
  });

  it('should execute a decision with context and argument', function () {
    var yes = new Block();
    var context = {a: 2};
    var decision = new Decision(function (response, context) {
      assert.strictEqual(response, 'hello world');
      assert.deepEqual(context, {a: 2});
      return 'yes';
    }, {
      yes: yes
    });

    var next = decision.execute('hello world', context);
    assert.deepEqual(next, {
      result: 'hello world',
      block: yes
    })
  });

});
