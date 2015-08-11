'use strict';

var expect = require('expect.js');

var History = require('../../lib/history.js'),
    Cookie = require('../../lib/cookie.js');

describe('History', function() {

    var cookie = new Cookie({
        cookie: '',
        location: {
            hostname: 'example.com'
        }
    });

    var history = new History(cookie, 'name');

    it('should be an instance of History', function() {
        expect(history).to.be.an(History);
    });

    describe('#get()', function() {
        it('should be []', function() {
            expect(history.get()).to.be.an('array');
            expect(history.get()).to.be.empty();
        });
    });

    describe('#set()', function() {
        it('should save the history', function() {
            history.set(['a', 'b']);
            expect(history.get()).to.be.an('array');
            expect(history.get()).to.be.contain('a');
            expect(history.get()).to.be.contain('b');
        });
    });

})
