'use strict';

var expect = require('expect.js'),
    _ = require('underscore');

var Referrer = require('../../lib/referrer.js');

var map = {
    criteo: [
        'http://criteo.com',
        'http://a.criteo.com',
        'https://criteo.net',
    ],
    doubleclick: [
        'http://a.b.doubleclick.com',
        'https://a.doubleclick.com',
        'https://doubleclick.com/foo',
    ],
    turn: [
        'http://a.turn.com',
        'https://b.turn.com',
    ],
    appnexus: [
        'http://adnxs.com',
        'https://adnxs.com',
        'http://a.adnxs.com',
        'https://a.b.adnxs.com',
    ],
    rubicon: [
        'http://rubiconproject.com',
        'https://a.rubiconproject.com',
        'http://a.b.rubiconproject.com',
        'https://a.rubiconproject.com/foo',
    ],
    yieldr: [
        'http://n.254a.com',
        'http://n.254a.com/pixel',
        'https://y.254a.com',
    ],
    google: [
        'http://google.com',
        'https://google.com',
        'https://mail.google.com',
        'http://a.google.com/foo',
    ],
    bing: [
        'http://bing.com',
        'https://a.bing.com',
        'http://a.bing.com/foo',
    ],
    yahoo: [
        'http://yahoo.com',
        'https://a.yahoo.com',
        'https://yahoo.com',
        'https://a.yahoo.com/foo',
    ]
};

describe('Referrer', function() {

    var referrer = new Referrer();

    it('should be an instance of Referrer', function() {
        expect(referrer).to.be.an(Referrer);
    });

    describe('#getName()', function() {
        _.each(map, function(urls, name) {
            _.each(urls, function(url) {
                it('should map "' + url + '" to ' + name, function() {
                    console.log(referrer.getName(url), name)
                    expect(referrer.getName(url)).to.be(name);
                });
            });
        });
    });
    describe('#getType()', function() {
        it('description', function() {
            // body...
        });
    });
    describe('#cleanUrl()', function() {
        it('description', function() {
            // body...
        });
    });
})
