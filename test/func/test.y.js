'use strict';

describe('y', function () {
    it('should be defined', function () {
        expect(y).not.to.be(undefined);
    });
    it('should be an object', function () {
        expect(y).to.be.a('object');
    });
    describe('map', function () {
        it('should be defined', function () {
            expect(y.map).not.to.be(undefined);
            expect(y.map).to.be.a('function');
        });
        it('should map an object', function () {
            y.map({a:{b:'x'}}, {foo: 'a.b', bar: 'z.y'}, false);
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
                    html: ['<img src="http://placehold.it/1x1" />'],
                    script: ['http://code.jquery.com/jquery-1.11.0.min.js'],
                    image: [
                        'http://placehold.it/1x1',
                        '' // should not be placed
                    ],
                    iframe: ['http://example.org']
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
