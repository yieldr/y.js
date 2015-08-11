'use strict';

var _ = require('underscore');

/**
 * Constructor.
 *
 * @param {Location} location
 */
var Query = module.exports = function(location) {

    /**
     * @type {Object}
     */
    this.params = {};

    this.init(location);
};

/**
 * Parses the url for query parameters.
 *
 * @param  {Location} location
 */
Query.prototype.init = function(location) {
    this.params = _.chain(location.search.slice(1).split('&'))
        .map(function(item) {
            if (item) {
                return item.split('=');
            }
        })
        .compact()
        .object()
        .value();
};

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
