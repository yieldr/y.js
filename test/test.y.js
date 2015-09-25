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
    describe('ab', function () {
        it('should be defined', function () {
            expect(y.ab).not.to.be(undefined);
            expect(y.ab).to.be.a('function');
        });
        it('should assign a group (a/b) if called without arguments', function () {
            var group = y.ab();
            expect(['a', 'b'].indexOf(group) !== -1).to.be.ok();
        });
        it('should assign a group (x/y/z) if called with arguments', function () {
            var groups = {x: 1, y: 2, z: 1};
            var group = y.ab(groups);
            expect(['x', 'y', 'z'].indexOf(group) !== -1).to.be.ok();
            for (var i = 0; i < 5; i++) {
                // Subsequent calls with the same distribution should not change
                // the cookie.
                expect(y.ab(groups)).to.equal(group);
            };
        });
    })
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
                    image: [
                        'http://www.google.com/favicon.ico',
                        '' // should not be placed
                    ],
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
    describe('stats', function () {
        it('should be defined', function () {
            expect(y.stats).not.to.be(undefined);
        });
        it('should be an object', function () {
            expect(y.stats).to.be.an('object');
        });
        describe('set', function () {
            it('should be a function', function () {
                expect(y.stats.set).to.be.a('function');
            });
            it('should set a value', function () {
                y.stats.set('foo', 'bar');
                expect(y.stats.get('foo')).to.be('bar');
            });
        });
        describe('incr', function () {
            it('should start at one if called for the first time', function () {
                y.stats.incr('counter')
                expect(y.stats.get('counter')).to.be(1);
            });
            it('should keep incrementing the value on subsequent calls', function () {
                y.stats.incr('counter');
                expect(y.stats.get('counter')).to.be(2);
            });
        });
        describe('push', function () {
            it('should create an array the first time', function () {
                y.stats.push('values', 1);
                expect(y.stats.get('values')).to.contain(1);
            });
            it('should keep adding values to the array on subsequent calls', function () {
                y.stats.push('values', 2);
                expect(y.stats.get('values')).to.have.length(2);
                expect(y.stats.get('values')).to.contain(1);
                expect(y.stats.get('values')).to.contain(2);
            });
        });
    });
});
