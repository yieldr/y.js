'use strict';

/**
 * An abstraction of a cookie storage.
 *
 * @constructor
 * @param {Document} document
 */
var Cookie = module.exports = function(document) {

    /**
     * @type {Document}
     */
    this.document = document;

    /**
     * @type {String}
     */
    this.hostname = document.location.hostname;
};

Cookie.prototype.get = function(name) {
    var cookie = '; ' + this.document.cookie,
        parts = cookie.split('; ' + name + '=');
    if (parts.length === 2) {
        return decodeURI(parts.pop().split(';').shift());
    }

    return '';
};

Cookie.prototype.set = function(name, value, extDays, date) {
    date = date || new Date();
    date.setDate(date.getDate() + extDays);
    this.document.cookie = name + "=" + encodeURI(value) + ";expires=" + date + ";domain=" + this.hostname + ";path=/";
};
