/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict';

describe('custom', function () {
    describe('yieldr', function () {
        it('should be defined', function () {
            expect(yieldr).not.to.be(undefined);
        });
        describe('data', function () {
            it('should be defined', function () {
                expect(yieldr.data).not.to.be(undefined);
            });
            it('should contain key "foo"', function () {
                expect(yieldr.data).to.have.property('foo');
            });
            describe('foo', function () {
                it('should have value "bar"', function () {
                    expect(yieldr.data.foo).to.be('bar');
                });
            });
        });
        describe('fire', function () {
            it('should have its "yo" parameter set to "yieldr"', function () {
                var elem = yieldr.fire({});
                expect(elem.src).to.contain('yo=yieldr');
            });
        });
    });
});
