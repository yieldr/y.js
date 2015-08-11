'use strict';

var _ = require('underscore');

/**
 * Picks elements from the object as defined by the mapping.
 *
 * @param {Object}  object
 * @param {Object}  mapping
 * @param {Boolean} all
 * @return {Object}
 */
module.exports.map = function(object, mapping, all) {
    return flatten(map(object, mapping, all), '', {});
}

/**
 * Maps values from an object based on a mapping.
 *
 * E.g:
 *
 *     map({a: {b: {c: "x"}}}, {foo: "a.b.c"}); // {foo: "x"}
 *
 * @param  {Object} object
 * @param  {Object} mapping
 * @return {Boolean}
 */
function map(object, mapping, all) {
    var mapped = {};
    _.each(mapping, function(value, key) {
        mapped[key] = extract(object, _.compact(value.split('.')));
    });
    if (all) {
        _.each(object, function(value, key) {
            mapped[key] = value;
        });
    }
    return mapped;
}

/**
 * Flattens a nested array into a single level object containing keys and
 * scalar values (numbers, strings, etc).
 *
 * @param  {*}      object
 * @param  {String} prefix
 * @return {Object}
 */
function flatten(object, prefix, flat) {
    flat = flat || {};
    prefix = prefix || '';
    if (_.isFunction(object)) {
        flatten(object(), prefix, flat);
    } else if (_.isObject(object)) {
        prefix = (prefix) ? prefix + '_' : '';
        _.each(object, function(value, key) {
            flatten(value, prefix + key, flat);
        });
    } else {
        flat[prefix] = object;
    }
    return flat;
}

/**
 * Extract a value by recursively visiting the path on each property of the
 * object.
 *
 *      extract({a: {b: {c: "x"}}}, ["a", "b", "c"]) // "x"
 *
 * @param  {Object} object
 * @param  {Array}  path
 * @return {String}
 */
function extract(object, path) {
    if (object && _.size(path) > 0) {
        var key = _.head(path);
        return extract(object[key], _.tail(path));
    }
    return object;
}
