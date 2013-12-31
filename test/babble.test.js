var assert = require('assert'),
    babble = require('../index'),
    Babbler = require('../lib/Babbler');

describe('babbler', function() {

  it('should create a babbler', function() {
    var emma = babble.babbler('emma0');
    assert.ok(emma instanceof Babbler);
  });

  it('should throw an error when creating a Babbler without id', function() {
    assert.throws(function () {babble.babbler(); });
  });

  // TODO: test reply, decide, then
});
