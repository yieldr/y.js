'use strict';

var expect = require('expect.js');

var AB = require('../../lib/ab.js');

var MockCookie = function() {
    this.cookie = {};
};

MockCookie.prototype.get = function (name) {
    return this.cookie[name];
};

MockCookie.prototype.set = function (name, value) {
    this.cookie[name] = value;
};

describe('AB', function () {

    var cookie = new MockCookie(),
        ab = new AB(cookie);

    it('should be an instance of AB', function () {
        expect(ab).to.be.an(AB);
    });

    var group = ab.group;

    describe('#init()', function () {
        it('should have a group of either "a" or "b"', function () {
            expect(['a', 'b']).to.contain(group);
        });
    });

    describe('#save()', function () {
        it('should save the group to the cookie', function () {
            expect(cookie.get('_yldr_ab')).to.be(group);
        });
    });

})
