/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict'

var assert = chai.assert

describe('y', function () {
    it('should be defined', function() {
        assert.notEqual(y, undefined)
    })
    it('should be an object', function() {
        assert.equal(typeof y, "object")
    })
    describe('callback', function() {
        it('should be defined', function() {
            assert.notEqual(y.callback, undefined)
        })
        it('should be a function', function() {
            assert.equal(typeof y.callback, "function")
        })
        it('should place piggybacks', function() {
            var response = {
                status: 'success',
                data: {
                    cases: [1, 2, 3],
                    html: ['<img src="http://www.google.com/favicon.ico" />'],
                    script: ['http://code.jquery.com/jquery-1.11.0.min.js'],
                    image: ['http://www.google.com/favicon.ico'],
                    iframe: ['http://example.com/']
                }
            };
            y.callback(response);
            assert.operator(document.getElementsByTagName('img').length, '>=', 2);
            assert.operator(document.getElementsByTagName('script').length, '>=', 1);
            assert.operator(document.getElementsByTagName('iframe').length, '>=', 1);
        })
    })
});