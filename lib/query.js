'use strict';

var _ = require('underscore');

/**
 * Constructor.
 *
 * @param {Query} url
 */
var Query = module.exports = function(url) {

    /**
     * @type {Object}
     */
    this.params = {};

    this.init(url);
};

/**
 * Parses the url for query parameters.
 *
 * @param  {String} url
 */
Query.prototype.init = function(url) {
    this.params = _.chain(location.search.slice(1).split('&'))
        .map(function(item) {
            if (item) {
                return item.split('=');
            }
        })
        .compact()
        .object()
        .value();
}

/**
 * Returns all the parameters present in the query string.
 *
 * @return {Object}
 */
Query.prototype.all = function() {
    return _.chain(this.params)
        .pairs()
        .map(function(pair) {
            var key = _.head(pair),
                val = _.last(pair);
            return [key.indexOf('utm_') > -1 ? key : 'q_' + key, val];
        })
        .object()
        .value();
}
