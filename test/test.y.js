/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict';

describe('y', function () {
    it('should be defined', function () {
        expect(y).not.to.be(undefined);
    });
    it('should be an object', function () {
        expect(y).to.be.an('object');
    });
    describe('dl', function () {
        it('should be defined', function () {
            expect(y.dl).not.to.be(undefined);
            expect(y.dl).to.be.a('function');
        });
        it('should gather data layer properties', function () {
            y.dl({a:{b:'x'}}, {foo: 'a.b', bar: 'z.y'}, false);
            expect(y.data).to.have.property('foo');
            expect(y.data.bar).to.be(undefined); // because 'z.y' doesn't exist.
        });
    });
    describe('callback', function () {
        it('should be defined', function () {
            expect(y.callback).not.to.be(undefined);
        })
        it('should be a function', function () {
            expect(y.callback).to.be.a('function');
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
            expect(elements).to.have.length(4);
        });
    })
    describe('fire', function () {
        it('should be defined', function () {
            expect(y.fire).not.to.be(undefined);
        });
        it('should be a function', function () {
            expect(y.fire).to.be.a('function');
        });
        it('should place a script tag', function () {
            var element = y.fire({'foo': 'bar'});
            expect(element.src).to.contain('foo=bar');
        });
    });
});
