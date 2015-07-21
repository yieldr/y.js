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
 * Checks whether a queue is defined in a legacy manner and transforms it to
 * work with tag version 2.
 *
 * @param  {Array|Object} queue
 * @return {Array}
 */
module.exports.makeCompatible = function(queue) {

    var compatible = [];

    if (_.isArray(queue)) {
        compatible.version = queue.version;
    } else {
        compatible.version = 'v1';
    }

    switch (compatible.version) {
        case 'v1':
            _.each(queue.data, function(value, key) {
                if (!_.contains(ignore, key)) {
                    if (_.has(rename, key)) {
                        compatible.push(_.union([rename[key]], value));
                    }
                    compatible.push(['set', key, value]);
                }
            });
            break;
        case 'v2':
            compatible = queue;
            break;
    }

    compatible.push(['track']);

    return compatible;
};
