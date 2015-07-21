'use strict';

/**
 * Constructor.
 *
 * @param  {Window} window
 * @param  {Cookie} cookie
 */
var Session = module.exports = function(window, cookie) {

    /**
     * @type {Cookie}
     */
    this.cookie = cookie;

    /**
     * @type {Storage}
     */
    this.storage = window.sessionStorage || {
        getItem: function(key) {
            return "";
        },
        setItem: function(key, value) {}
    };

    this.init();
    this.save();
};

/**
 * Upon initialization all session related values will be retrieved from the
 * underlying session storage.
 */
Session.prototype.init = function() {

    this.id = this.get('_yldr_session');
    this.ts = this.get('_yldr_session_ts') || Date.now() / 1000 | 0;
    this.sfq = 1 + (+this.get('_yldr_session_fq')) || 1;

    this.snr = +this.cookie.get('_yldr_session_nr') || 1,
        this.ufq = 1 + (+this.cookie.get('_yldr_user_fq')) || 1;

    if (!this.id) {
        this.id = this.uuid();
        this.snr++; // if this session is new, increment the session number.
    }
};

/**
 * Flushes the initialized properties to the underlying session storage.
 */
Session.prototype.save = function() {
    this.set('_yldr_session', this.id);
    this.set('_yldr_session_ts', this.ts);
    this.set('_yldr_session_fq', this.sfq);
    this.cookie.set('_yldr_session_nr', this.snr);
    this.cookie.set('_yldr_user_fq', this.ufq);
};


/**
 * When passed a key name, will return that key's value.
 *
 * See: https://goo.gl/7dKjES
 *
 * @param  {String} key
 * @return {String}
 */
Session.prototype.get = function(key) {
    return this.storage.getItem(key);
};

/**
 * When passed a key name and value, will add that key to the storage, or update
 * that key's value if it already exists.
 *
 * See: https://goo.gl/HCSxxz
 *
 * @param {String} key
 * @param {String} value
 */
Session.prototype.set = function(key, value) {
    this.storage.setItem(key, value);
};

/**
 * User engagement is calculated as the number of sessions divided by the users
 * total visits. More total visits and less sessions means higher engagement.
 *
 * @return {Number}
 */
Session.prototype.userEngagement = function() {
    return 1 - (this.snr / this.ufq);
};

/**
 * Session engagement is calculated as the number of session visits divided by
 * the sessions duration. More visits in a shorter duration means higher
 * engagement.
 *
 * @return {Number}
 */
Session.prototype.sessionEngagement = function() {
    return Math.log(this.sfq) / (Math.log((Date.now() / 1000 | 0) - this.ts));
};

/**
 * Generates a version 4 UUID.
 *
 * @return {String}
 */
Session.prototype.uuid = function() {
    var rand = function(x) {
            if (x < 0) return NaN;
            if (x <= 30) return (0 | Math.random() * (1 << x));
            if (x <= 53) return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
            return NaN
        },
        hex = function(num, length) {
            var str = num.toString(16),
                i = length - str.length,
                z = "0";
            for (; i > 0; i >>>= 1, z += z) {
                if (i & 1) {
                    str = z + str;
                }
            }
            return str;
        };

    return hex(rand(32), 8)
        + "-"
        + hex(rand(16), 4)
        + "-"
        + hex(0x4000 | rand(12), 4)
        + "-"
        + hex(0x8000 | rand(14), 4)
        + "-"
        + hex(rand(48), 12);
}
