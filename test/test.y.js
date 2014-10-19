/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict'

var assert = chai.assert

describe('y', function () {
    it('should be defined', function() {
        assert.isDefined(y)
    })
    it('should be an object', function() {
        assert.typeOf(y, "object")
    })
    describe('callback', function() {
        it('should be defined', function() {
            assert.isDefined(y.callback)
        })
        it('should be a function', function() {
            assert.typeOf(y.callback, "function")
        })
        it('should place piggybacks', function() {
            var response = {
                status: 'success',
                data: {
                    cases: [1, 2, 3],
                    // html: ['<img src="http://en.wikipedia.org/favicon.ico" />'],
                    script: ['http://code.jquery.com/jquery-1.11.0.min.js'],
                    image: ['http://www.google.com/favicon.ico'],
                    iframe: ['http://example.com/']
                }
            };
            y.callback(response);
            assert.operator(document.getElementsByTagName('img').length, '>=', 1);
            assert.operator(document.getElementsByTagName('script').length, '>=', 1);
            assert.operator(document.getElementsByTagName('iframe').length, '>=', 2);
        })
    })
    describe('fire', function() {
        it('should be defined', function() {
            assert.isDefined(y.fire)
        })
        it('should be a function', function() {
            assert.typeOf(y.fire, "function")
        })
        it('should place a script tag with src set to *.254a.com', function() {
            y.fire({"foo":"bar"});
            var elements = document.getElementsByTagName('script'), found = false;
            for (var i = elements.length - 1; i >= 0; i--) {
                var element = elements[i]
                if (element.src) {
                    if (element.src.indexOf(".254a.com/pixel?foo=bar") !== -1) {
                        found = true;
                    }
                }
            };
            assert.equal(found, true);
        })
    })
});