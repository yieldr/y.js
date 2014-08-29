/**
 * Yieldr JavaScript Tracker - Test Suite
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
'use strict'

var assert = chai.assert

describe('y', function () {
    // Cookie
    describe('cookie', function () {

        it('should be defined', function () {
            assert.isDefined(y.cookie);
        })

        describe('get', function () {
            it('should return null if not set', function () {
                var cookie = y.cookie.get('ysess');
                assert.isNull(cookie)
            })
        })
        describe('set', function () {
            it('should drop a cookie', function () {
                y.cookie.set('ysess', 'alex', 30, 'alex.com');
            })
        })
    })

    describe('url', function () {

        describe('parseQuery', function () {
            it('should return query parameters as key value pairs', function () {
                var query = y.url.parseQuery('http://example.com?a=foo&b=bar&c=baz')
                assert.isObject(query);
                assert.property(query, 'a');
                assert.property(query, 'b');
                assert.property(query, 'c');
                assert.equal(query.a, 'foo');
                assert.notEqual(query.b, 'baz');
            })
        })
    })

    describe('referrer', function () {

        var domains = {
            "criteo": "http://criteo.com",
            "doubleclick": "https://doubleclick.com"
        };

        describe('name', function() {
            it('should return the correct name per vendor', function() {
                for (var name in domains) {
                    assert.equal(name, y.referrer.name(domains[name]));
                }
            })
        })

        describe('isDisplay', function() {
            it('should return true for display vendors', function() {
                for (var name in domains) {
                    assert.isTrue(y.referrer.isDisplay(name));
                }
            })

        })
    })
});