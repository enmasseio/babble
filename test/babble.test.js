var assert = require('assert');
var babble = require('../index');
var Babbler = require('../lib/Babbler');

var Tell = require('../lib/block/Tell');
var Listen = require('../lib/block/Listen');
var Decision = require('../lib/block/Decision');
var Then = require('../lib/block/Then');

describe('babbler', function() {

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
    assert.ok(block instanceof Tell);
    assert.ok(block.next instanceof Listen);
  });

  it('should create a flow starting with a decision block', function() {
    var block = babble.decide(function () {}, {});
    assert.ok(block instanceof Decision);
  });

  it('should create a flow starting with a Then block', function() {
    var block = babble.then(function () {});
    assert.ok(block instanceof Then);
  });
});
