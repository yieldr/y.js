/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict'

var assert = chai.assert

describe('custom', function () {
   describe('yieldr', function() {
        it('should be defined', function() {
            assert.isDefined(yieldr);
        })
        describe('data', function() {
            it('should be defined', function() {
                assert.isDefined(yieldr.data);
            })
            it('should contain key "foo"', function() {
                assert.property(yieldr.data, 'foo')
            })
            describe('foo', function() {
                it('should have value "bar"', function() {
                    assert.equal(yieldr.data.foo, "bar")
                })
            })
        })
        describe('fire', function() {
            it('should have its "yo" parameter set to "yieldr"', function() {
                yieldr.fire({});
                var elements = document.getElementsByTagName('script'), found = false;
                for (var i = elements.length - 1; i >= 0; i--) {
                    var element = elements[i]
                    if (element.src) {
                        if (element.src.indexOf(".254a.com/pixel?yo=yieldr") !== -1) {
                            found = true;
                        }
                    }
                };
                assert.equal(found, true);
            })
        })
    })
});