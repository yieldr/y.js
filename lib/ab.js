'use strict';

var _ = require('underscore');

/**
 * A/B Testing.
 *
 * @constructor
 * @param  {Cookie} cookie The underlying cookie storage
 */
var AB = module.exports =  function (cookie) {

    /**
     * @type {Cookie}
     */
    this.cookie = cookie;

    this.init();
    this.save();
};

/**
 * Initializes A/B testing by assigning the user to a random group.
 */
AB.prototype.init = function () {
    this.group = this.cookie.get('_yldr_ab');
    if (!_.contains(['a', 'b'], this.group)) {
        this.group = (Math.random() >= 0.5) ? 'a': 'b';
    }
};

/**
 * Saves the users group to the cookie.
 */
AB.prototype.save = function () {
    this.cookie.set('_yldr_ab', this.group, 30);
};
