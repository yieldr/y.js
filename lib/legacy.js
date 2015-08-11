'use strict';

var _ = require('underscore');

/**
 * @exports legacy
 */

var rename = {
    '_dl': 'map'
};

var ignore = ['_elem'];

/**
 * Checks the version of a tag given an async queue.
 *
 * @param  {Array|Object} queue
 * @return {String}
 */
function checkVersion(queue) {
    if (!_.isUndefined(queue.version)) {
        return queue.version;
    } else if (_.isArray(queue)) {
        return 'v2';
    }
    return 'v1';
}

/**
 * Checks whether a queue is defined in a legacy manner and transforms it to
 * work with tag version 2.
 *
 * @param  {Array|Object} queue
 * @return {Array}
 */
module.exports.makeCompatible = function(queue) {

    var compatible = [];

    switch (checkVersion(queue)) {
        case 'v1':
            _.each(queue.data, function(value, key) {
                if (!_.contains(ignore, key)) {
                    if (_.has(rename, key)) {
                        compatible.push(_.union([rename[key]], value));
                    } else {
                        compatible.push(['set', key, value]);
                    }
                }
            });
            if (_.has(queue, 'domain')) {
                compatible.push(['remote', queue.domain]);
            }
            compatible.push(['track']);
            break;
        case 'v2':
            compatible = queue;
            break;
    }

    return compatible;
};
