'use strict';

var _ = require('underscore');

/**
 * Constructor.
 */
var Referrer = module.exports = function() {

    /**
     * @type {Object}
     */
    this.map = {
        criteo: 'https?://(.*)criteo.([^/?]*)',
        doubleclick: 'https?://(.*)doubleclick.([^/?]*)',
        turn: 'https?://(.*)turn.([^/?]*)',
        appnexus: 'https?://(.*)adnxs.([^/?]*)',
        rubicon: 'https?://(.*)rubiconproject.([^/?]*)',
        yieldr: 'https?://(.*)254a.([^/?]*)',
        google: 'https?://(.*)google.([^/?]*)',
        bing: 'https?://(.*)bing.com',
        yahoo: 'https?://(.*)yahoo.com'
    };

    /**
     * @type {Array}
     */
    this.displayReferrers = [
        'criteo',
        'doubleclick',
        'turn',
        'appnexus',
        'rubicon',
        'yieldr'
    ];

    /**
     * @type {Array}
     */
    this.searchReferrers = [
        'google',
        'bing',
        'yahoo'
    ];
};

/**
 * Tries to match a name to a url based on a known list of referrers.
 *
 * @param  {String} url
 * @return {String}
 */
Referrer.prototype.getName = function(url) {
    _.each(this.map, function(pattern, name) {
        if (url.search(pattern) > -1) {
            return name;
        }
    });
    return this.cleanUrl(url);
};

/**
 * Tries to match a type to a url, if the url matches a known referrer.
 *
 * @param  {String} url
 * @return {String}
 */
Referrer.prototype.getType = function(url) {
    var name = this.getName(url);
    if (_.contains(this.displayReferrers, name)) {
        return 'display';
    } else if (_.contains(this.searchReferrers, name)) {
        return 'search';
    }
    return 'other';
};

/**
 * Returns the url without protocol.
 *
 * @param  {String} url
 * @return {String}
 */
Referrer.prototype.cleanUrl = function(url) {
    return url.replace(/^https?\:\/\//, '').split(/[/?#]/)[0];
};
