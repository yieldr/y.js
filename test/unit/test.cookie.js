'use strict';

var expect = require('expect.js');

var Cookie = require('../../lib/cookie.js');

describe('Cookie', function() {

    var cookie = new Cookie({
        cookie: '',
        location: {
            hostname: 'example.com'
        }
    });

    it('should be an instance of Cookie', function() {
        expect(cookie).to.be.an(Cookie);
    });

    describe('#get()', function() {
        it('should return "" the first time', function() {
            expect(cookie.get('name')).to.be('');
        });
    });

    describe('#set()', function() {
        it('should set a cookie', function() {
            var date = new Date();
            cookie.set('name', 'value', 1, date);
            expect(cookie.document.cookie).to.be('name=value;expires='+date+';domain=example.com;path=/');
        });
    });

    describe('#get()', function () {
        it('should return "value" the second time', function () {
            expect(cookie.get('name')).to.be('value');
        });
    });

})
