/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict';

var assert = chai.assert;

describe('y', function () {
    it('should be defined', function () {
        assert.isDefined(y);
    });
    it('should be an object', function () {
        assert.typeOf(y, 'object');
    });
    describe('event', function () {
        it('should be defined', function () {
            assert.isDefined(y.elem);
        });
        it('should execute when event triggers', function () {
            var executed = false;
            y.elem('a#test', 'click', function (element) {
                executed = true;
                assert.include(element.src, 'event=click');
                assert.include(element.src, 'selector=' + encodeURIComponent('a#test'));
            });

            var event = document.createEvent('HTMLEvents');
            event.initEvent('click');
            document.getElementById('test').dispatchEvent(event); // click it!

            assert.isTrue(executed);
        });
        it('should include element attributes', function () {
            var executed = false;
            y.elem('a#test', 'click', function (element) {
                executed = true;
                assert.include(element.src, 'event=click');
                assert.include(element.src, 'selector=' + encodeURIComponent('a#test'));
                assert.include(element.src, 'attr_id=test');
                assert.include(element.src, 'attr_href=' + encodeURIComponent('#'));
            }, ['id', 'href']);
            var event = document.createEvent('HTMLEvents');
            event.initEvent('click');
            document.getElementById('test').dispatchEvent(event); // click it!

            assert.isTrue(executed);
        });
    });
    describe('dl', function () {
        it('should be defined', function () {
            assert.isDefined(y.dl);
        });
        it('should gather data layer properties', function () {
            y.dl({a:{b:'x'}}, {foo: 'a.b', bar: 'z.y'}, false);
            assert.property(y.data, 'foo');
            assert.notProperty(y.data, 'bar'); // because 'z.y' doesn't exist.
        });
    });
    describe('callback', function () {
        it('should be defined', function () {
            assert.isDefined(y.callback);
        })
        it('should be a function', function () {
            assert.typeOf(y.callback, 'function');
        })
        it('should place piggybacks', function () {
            var response = {
                status: 'success',
                data: {
                    cases: [1, 2, 3],
                    html: ['<img src="http://en.wikipedia.org/favicon.ico" />'],
                    script: ['http://code.jquery.com/jquery-1.11.0.min.js'],
                    image: ['http://www.google.com/favicon.ico'],
                    iframe: ['http://example.com/']
                }
            };
            var elements = y.callback(response);
            assert.lengthOf(elements, 4);
        });
    })
    describe('fire', function () {
        it('should be defined', function () {
            assert.isDefined(y.fire);
        });
        it('should be a function', function () {
            assert.typeOf(y.fire, 'function');
        });
        it('should place a script tag', function () {
            var element = y.fire({'foo': 'bar'});
            assert.include(element.src, 'foo=bar');
        });
    });
});
