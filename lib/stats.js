'use strict';

/**
 * Constructor.
 */
var Stats = module.exports = function() {

    /**
     * @type {Object}
     */
    this.data = {};
};

/**
 * Returns the value stored at key.
 *
 * @param  {String} key
 * @return {*}
 */
Stats.prototype.get = function(key) {
    return this.data[key];
};

/**
 * Sets a value at key.
 *
 * @param {String} key
 * @param {*}      value
 */
Stats.prototype.set = function(key, value) {
    this.data[key] = value;
};

/**
 * Increments the counter at key.
 *
 * @param {String} key
 */
Stats.prototype.incr = function(key) {
    var value = this.data[key] || 0;
    this.data[key] = ++value;
};

/**
 * Adds value to the array stored at key. If the key is undefined, an empty
 * array will be created and the value appended to it.
 *
 * @param  {String} key
 * @param  {*}      value
 */
Stats.prototype.push = function(key, value) {
    this.data[key] = this.data[key] || [];
    this.data[key].push(value);
};

/**
 * Returns all keys values.
 *
 * @return {Object}
 */
Stats.prototype.all = function() {
    return this.data;
};

/**
 * Sends all collected statistics to the target window using Window.postMessage.
 *
 * See: https://goo.gl/Qm62eP
 *
 * @param  {Window} target
 */
Stats.prototype.send = function (target) {
    target.postMessage(this.data, '*');
}
