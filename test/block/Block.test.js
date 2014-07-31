var assert = require('assert');
var Block = require('../../lib/block/Block');

describe('Block', function() {

  it('should create a block', function () {
    var block = new Block();
    assert.ok(block instanceof Block);
  });

  it('should refuse to run an (abstract) block', function () {
    var block = new Block();
    assert.throws(function () {block.execute()});
  });

});
