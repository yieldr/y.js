'use strict';

var _ = require('underscore');

/**
 * Stores the users referrer history.
 *
 * @constructor
 * @param {Cookie} cookie
 */
var History = module.exports = function(cookie, cookieName) {

    /**
     * @type {Cookie}
     */
    this.cookie = cookie;

    /**
     * @type {String}
     */
    this.cookieName = cookieName || '_yldr_history';

    /**
     * @public
     * @type {Array}
     */
    this.history = [];
};

/**
 * Get the users referrer history.
 *
 * @return {Array}
 */
History.prototype.get = function () {
    var cookie = this.cookie.get(this.cookieName);
    return _.compact(cookie.split('|'));
};

/**
 * Set the users referrer history.
 *
 * @param {Array} history
 */
History.prototype.set = function (history) {
    this.cookie.set(this.cookieName, history.join('|'), 30);
};
