/**
 * Yieldr JavaScript Tracker
 *
 * This library is being served to clients implementing the Yieldr tracking
 * snippet. On a high level it defines a single JSON-P function responsible for
 * performing actions based on the tracking server response.
 *
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 * @author Jasper Spijkstra <jasper.spijkstra@yieldr.com>
 */
(function(window, document) {
    'use strict';

    // jshint ignore:start

    // See: http://goo.gl/RkFUke
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // jshint ignore:end

    /**
     * Adds an event to an element. See http://goo.gl/4YaaZO
     *
     * @param {Object}   elem
     * @param {String}   type
     * @param {Function} fn
     */
    function addEvent(elem, type, fn) {
        if (elem.attachEvent) {
            elem['e' + type + fn] = fn;
            elem[type + fn] = function() {
                elem['e' + type + fn](window.event);
            };
            elem.attachEvent('on' + type, elem[type + fn]);
        } else {
            elem.addEventListener(type, fn, false);
        }
    }

    /**
     * Removes an event from an element. See http://goo.gl/4YaaZO
     *
     * @param  {[type]}   elem
     * @param  {[type]}   type
     * @param  {Function} fn
     * @return {[type]}
     */
    function removeEvent(elem, type, fn) {
        if (elem.detachEvent) {
            elem.detachEvent('on' + type, elem[type + fn]);
            elem[type + fn] = null;
        } else {
            elem.removeEventListener(type, fn, false);
        }
    }

    /**
     * Creates a random hex string of four bytes.
     *
     * @return {String}
     */
    function hash() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    /**
     * Creates a random string in the form XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXX
     * similar to a UUID.
     *
     * @return {String}
     */
    function uuid() {
        return hash() + hash() +
            "-" + hash() +
            "-" + hash() +
            "-" + hash() +
            "-" + hash() +
            hash() + hash();
    }

    /**
     * Merges an array of objects.
     *
     * @param  {Array} objects
     * @return {Object}
     */
    function merge(objects) {
        var merged = {};
        for (var i = 0, len = objects.length; i < len; i++) {
            for (var property in objects[i]) {
                if (objects[i].hasOwnProperty(property)) {
                    merged[property] = objects[i][property];
                }
            }
        }
        return merged;
    }

    /**
     * Iterates the properties of an object.
     *
     * @param  {Object}   object
     * @param  {Function} callback
     */
    function forEach(object, callback) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                callback(key, object[key]);
            }
        }
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
        forEach(mapping, function(key, value) {
            mapped[key] = extract(object, value.split('.'));
        });
        if (all) {
            forEach(object, function(key, value) {
                mapped[key] = value;
            });
        }
        return mapped;
    }

    /**
     * Flattens a nested array into a single level object containing keys and
     * scalar values (numbers, strings, etc).
     *
     * @param  {Object} object
     * @param  {String} prefix
     * @return {Object}
     */
    function flatten(object, prefix, flat) {
        flat = flat || {};
        prefix = prefix || '';

        if (object instanceof Function) {
            flatten(object(), prefix, flat);
        } else if (object instanceof Array) {
            for (var i = 0, l = object.length; i < l; i++) {
                flatten(object[i], prefix + '_' + i, flat);
            }
        } else if (object instanceof Object) {
            prefix = (prefix) ? prefix + '_' : '';
            forEach(object, function(key, value) {
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
        if (object && path.length > 0) {
            var visited = path.shift();
            return extract(object[visited], path);
        }
        return object;
    }

    /**
     * Gets the current time in seconds.
     *
     * @return {Number} [description]
     */
    function timeNow() {
        return Math.floor(new Date().getTime() / 1000);
    }

    /**
     * Describe an object which is able to manipulate html elements.
     *
     * @type {Object}
     */
    var element = (function() {

        /**
         * Maps element types to functions that can handle their placement.
         *
         * @return {Function}
         */
        function map(type) {
            switch (type) {
                case 'html':
                    return html;
                case 'image':
                    return image;
                case 'script':
                    return script;
                case 'iframe':
                    return iframe;
            }
            return null;
        }

        /**
         * Alias to document.createElement
         *
         * @param  {String} type
         * @return {HTMLElement}
         */
        function image(url) {
            var e = document.createElement('img');
            e.width = 0;
            e.height = 0;
            e.border = 0;
            e.src = url;
            return e;
        }

        /**
         * Creates a <script> tag with specified url as source.
         *
         * @param  {String} url
         * @return {HTMLElement}
         */
        function script(url) {
            var e = document.createElement('script');
            e.type = "text/javascript";
            e.src = url;
            e.async = !0;
            return e;
        }

        /**
         * Creates an <iframe> tag with specified url as source.
         *
         * @param  {String} url
         * @return {HTMLElement}
         */
        function iframe(url) {
            var e = document.createElement('iframe');
            e.frameBorder = 0;
            e.width = 0;
            e.height = 0;
            e.style.display = 'none';
            e.style.visibility = 'hidden';
            if (url) {
                e.src = url;
            }
            return e;
        }

        /**
         * Creates an <iframe> tag with specified content.
         *
         * @param  {String} content
         * @return {HTMLElement}
         */
        function html(content) {
            var e = document.body.appendChild(iframe());
            e.frameBorder = 0;
            e.width = 0;
            e.height = 0;
            window.setTimeout(function() {
                var d = e.contentWindow.document;
                d.open();
                d.write(content);
                d.close();
            }, 1);
            return e;
        }

        return {
            map: map,
            image: image,
            script: script,
            iframe: iframe,
            html: html
        };

    }());

    /**
     * Describe an object which is able to manipulate cookies.
     *
     * @type {Object}
     */
    var cookie = (function() {

        /**
         * Sets a cookie.
         *
         * @param  {String} name
         * @param  {String} value
         * @param  {String} extDays
         * @param  {String} domain
         */
        function set(name, value, extDays, domain) {
            var date = new Date();
            date.setDate(date.getDate() + extDays);
            document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + date + ";domain=" + domain + ";path=/";
        }

        /**
         * Gets a cookies value.
         *
         * @param  {String} name
         * @return {String}
         */
        function get(name) {
            var cookie = "; " + document.cookie,
                parts = cookie.split("; " + name + "=");
            if (parts.length === 2) {
                return decodeURIComponent(parts.pop().split(";").shift());
            }
            return '';
        }

        return {
            get: get,
            set: set
        };

    }());

    /**
     * Represents an object able to manipulate session storage.
     *
     * @return {Object}
     */
    var session = (function() {

        /**
         * The session storage object.
         *
         * @type {Object}
         */
        var storage = window.sessionStorage || {
            getItem: function() { return ""; },
            setItem: function() {}
        };

        /**
         * Set a value.
         *
         * @param {String} key
         * @param {String} value
         */
        function set(key, value) {
            storage.setItem(key, value);
        }

        /**
         * Gets a value.
         *
         * @param  {String} key
         * @return {String}
         */
        function get(key) {
            return storage.getItem(key);
        }

        return {
            get: get,
            set: set
        };

    }());

    /**
     * Represents a set data structure for manipulating strings.
     *
     * @return {Object}
     */
    var strings = (function() {

        /**
         * Holds the items in the set.
         */
        var items = [];

        /**
         * Adds an item to the set if doesn't already exist.
         *
         * @param {String} item
         */
        function add(item) {
            if (item.length > 0 && items.indexOf(item) === -1) {
                items.push(item);
            }
            return self;
        }

        /**
         * Splits a string of elements and stores in the set.
         *
         * @param  {String} sep
         */
        function split(str, sep) {
            var elements = str.split(sep);
            for (var i = 0, len = elements.length; i < len; i++) {
                add(elements[i]);
            }
            return self;
        }

        /**
         * Joins the elements in the set with separator.
         *
         * @param  {String} sep
         * @return {String}
         */
        function join(sep) {
            return items.join(sep);
        }

        /**
         * Defines the public api of the history object. We use a named variable
         * so that we can return it from methods, creating a fluent interface.
         *
         * @type {Object}
         */
        var self = {
            add: add,
            join: join,
            split: split
        };

        return self;

    }());

    /**
     * Describe an object which is able to manipulate a URL.
     *
     * @type {Object}
     */
    var url = (function() {

        /**
         * Extracts the URL query parameters in key value pairs.
         *
         * @param  {String} url
         * @param  {String} prefix
         * @return {Object}
         */
        function query(url, callback) {
            var split = url.split("?");
            if (split.length >= 2) {
                var pairs = split[1].split('&');
                for (var i = 0, length = pairs.length; i < length; i++) {
                    var pair = pairs[i].split('=');
                    if (pair.length === 2) {
                        callback(pair[0], pair[1]);
                    }
                }
            }
        }

        return {
            query: query
        };

    }());

    var referrer = (function() {

        /**
         * Maps url regular expressions to third parties.
         *
         * @type {Object}
         */
        var map = {
            "https?://(.*)criteo.([^/?]*)": "criteo",
            "https?://(.*)doubleclick.([^/?]*)": "doubleclick",
            "https?://(.*)turn.([^/?]*)": "turn",
            "https?://(.*)adnxs.([^/?]*)": "appnexus",
            "https?://(.*)rubiconproject.([^/?]*)": "rubicon",
            "https?://(.*)254a.([^/?]*)": "yieldr",
            "https?://(.*)google.([^/?]*)": "google",
            "https?://(.*)bing.com": "bing",
            "https?://(.*)yahoo.com": "yahoo"
        };

        /**
         * Display third parties.
         *
         * @type {Array}
         */
        var display = ["criteo", "doubleclick", "turn", "appnexus", "rubicon", "yieldr"];

        /**
         * Search engines.
         *
         * @type {Array}
         */
        var search = ["google", "bing", "yahoo"];

        /**
         * Returns the type of a URL.
         *
         * @param  {String} url
         * @return {String}
         */
        function type(url) {
            var n = name(url);
            if (-1 !== display.indexOf(n)) {
                return 'display';
            } else if (-1 !== search.indexOf(n)) {
                return 'search';
            }
            return 'other';
        }

        /**
         * Tries to match a name to a referrer url based on a known list.
         *
         * @param  {String} url
         * @return {String}
         */
        function name(url) {
            for (var regex in map) {
                if (-1 !== url.search(regex)) {
                    return map[regex];
                }
            }
            return clean(url);
        }

        /**
         * Cleans a url.
         *
         * @param  {String} url
         * @return {String}
         */
        function clean(url) {
            return url.replace(/^https?\:\/\//, '').split(/[/?#]/)[0];
        }

        /**
         * Returns the search keywords from the referrer if the referrer is a
         * search engine. Most search engines use the q query parameter except
         * yahoo which uses p.
         *
         * @param  {String} url
         * @return {String}
         */
        function keywords(url) {
            var n = name(url),
                k = null,
                m = function(regex) {
                    var match = url.match(regex);
                    return (match && match.length > 1) ? match[1] : null;
                };
            switch (search.indexOf(n)) {
                case 0:
                case 1:
                    k = m(/q\=([\w\d-+_\%]*)/);
                    break;
                case 2:
                    k = m(/p\=([\w\d-+_\%]*)/);
                    break;
            }
            return k;
        }

        return {
            name: name,
            type: type,
            clean: clean,
            keywords: keywords
        };

    }());

    var alias = window.YieldrTrackingObject || 'y';

    var y = window[alias];

    y.stats = (function() {

        var data = {};

        /**
         * Sets a value at key.
         *
         * @param {String} key
         * @param {*}      value
         */
        function set(key, value) {
            data[key] = value;
        }

        /**
         * Increments the counter at key.
         *
         * @param  {String} key
         */
        function incr(key) {
            data[key] = data[key] || 0;
            data[key]++;
        }

        /**
         * Adds value to the array stored at key. If the key is undefined, an
         * empty array will be created and the value appended to it.
         *
         * @param  {String} key
         * @param  {*}      value
         */
        function push(key, value) {
            if (!data[key]) {
                data[key] = [value];
            } else {
                data[key].push(value);
            }
        }

        /**
         * Returns the value stored at key.
         *
         * @param  {String} key
         * @return {*}
         */
        function get(key) {
            return data[key];
        }

        /**
         * Returns all the collected statistics.
         *
         * @return {Object}
         */
        function all() {
            return data;
        }

        return {
            get: get,
            set: set,
            incr: incr,
            push: push,
            all: all
        };
    }());

    /**
     * Places the piggybacks as given to us by the tracking server.
     *
     * @param  {Object} response
     * @return {Array}  an array of elements that were placed on the document
     */
    y.callback = function(response) {
        var elements = [];
        if (response.status === 'success') {
            var body = document.getElementsByTagName("body")[0];
            y.stats.set('cases', response.data.cases || response.data.case_id);
            forEach(response.data, function(type, piggybacks) {
                forEach(piggybacks, function(i, piggyback) {
                    var func = element.map(type);
                    if (func && piggyback) {
                        elements.push(body.appendChild(func(piggyback)));
                        y.stats.push('piggybacks', piggyback);
                    }
                });
            });
        }
        y.stats.incr('callback');
        return elements;
    };

    /**
     * Performs an HTTP request to the remote server.
     *
     * @param  {Object} params
     * @return {Node}   the element that was placed on the document
     */
    y.fire = function(params) {
        var pairs = [];
        forEach(params, function(key, value) {
            if (value !== undefined) {
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        });
        var element = document.createElement('script');
        element.src = document.location.protocol + '//' + y.domain + '/pixel?' + pairs.join('&');
        var sibling = document.getElementsByTagName("script")[0];
        sibling.parentNode.insertBefore(element, sibling);
        y.stats.set('parameters', params);
        y.stats.incr('fire');
        return element;
    };

    /**
     * Uses data from external sources such as a tag managers data layer.
     *
     * @param {Object}  object
     * @param {Object}  mapping
     * @param {Boolean} all
     */
    y.dl = function(object, mapping, all) {
        if (!mapping) {
            mapping = {};
        }
        var data = flatten(map(object, mapping, all));
        y.data = merge([y.data, data]);
    };

    /**
     * Performs A/B testing.
     *
     */
    y.ab = function(groups) {
        // Use a simple a/b when there are no groups provided
        if (!groups) {
            groups = {
                "a": 0.5,
                "b": 0.5
            };
        }

        // Grab the host name so we use it to save 1st party cookies.
        var host = document.location.hostname;

        // Check if this user is already in one of the configured groups
        var group = cookie.get('_yldr_ab', host);

        if (groups[group] === undefined) {
            // Distributions per group can be arbitrarily defined. It is normal
            // to define a distribution where the sum of distributions isn't a
            // round number such as 1 or 100.
            //
            // For example the distribution {a: 3, b: 6, c: 5} the random number
            // should be between 0 and 3+6+5.
            var totalDistribution = 0;
            forEach(groups, function(name, distribution) {
                totalDistribution += distribution;
            });

            // Get a random number between 0 and totalDistribution. Math.random
            // returns a number between 0 and 1 so multiplying it by the
            // totalDistribution our random number is guaranteed to be no bigger
            // than totalDistribution.
            var rand = Math.random() * totalDistribution;

            // We'll iterate over the distributions and if rand falls within a
            // certain distribution we assign the user to that group.
            var sumDistribution = 0;
            forEach(groups, function(name, distribution) {
                if (rand >= sumDistribution && rand <= sumDistribution + distribution) {
                    group = name;
                }
                sumDistribution += distribution;
            });

            // Save the A/B group in a cookie.
            cookie.set('_yldr_ab', group, 30, host);
        }

        // Merge the group with the rest of the data sent to the server.
        y.data = merge([y.data, {ab: group}]);

        return group;
    };

    /**
     * Initiates tracking.
     *
     * @return {Node}
     */
    y.track = function() {
        // Aliases.
        var location = document.location,
            host = location.hostname,
            path = location.pathname,
            hash = location.hash,
            href = location.href,
            ref = document.referrer || 'NO_REFERRER';

        // Traffic source.
        var traffic = [
            referrer.name(ref), // traffic source
            referrer.type(ref), // traffic type
        ];

        if (traffic[1] === 'search') {
            traffic.push(referrer.keywords(ref));
        }

        // History of traffic sources.
        var history = strings
            .split(cookie.get('_yldr_history'), '|')
            .add(traffic[0])
            .join('|');

        cookie.set('_yldr_history', history, 30, host);

        // Sessions and Cookies.
        var sessionId = session.get('_yldr_session'),
            sessionTs = session.get('_yldr_session_ts') || timeNow(),
            sessionFq = 1 + (+session.get('_yldr_session_fq')) || 1, // + "1" === 1
            sessionNr = +cookie.get('_yldr_session_nr') || 1,
            userFq = 1 + (+cookie.get('_yldr_user_fq')) || 1;

        if (!sessionId) {
            sessionId = uuid();
            if (userFq > 1) {
                sessionNr++;
            }
            session.set('_yldr_session', sessionId);
            session.set('_yldr_session_fq', sessionFq);
            session.set('_yldr_session_ts', sessionTs);
            session.set('_yldr_traffic_src', traffic[0]);
            session.set('_yldr_traffic_type', traffic[1]);
        } else {
            session.set('_yldr_session_fq', sessionFq);
            traffic[0] = session.get('_yldr_traffic_src');
            traffic[1] = session.get('_yldr_traffic_type');
        }

        // We calculate the user engagement as the division of session visits by
        // the sessions duration. More visits in a shorter duration means higher
        // engagement.
        var sessionEngagement = Math.log(sessionFq) / (Math.log(timeNow() - sessionTs));

        // The user engagement is calculated as the number of sessions divided
        // by the users total visits. More total visits and less sessions means
        // higher engagement.
        var userEngagement = 1 - (sessionNr / userFq);

        cookie.set('_yldr_user_fq', userFq, 30, host);
        cookie.set('_yldr_session_nr', sessionNr, 30, host);

        var query = {},
            utm = {};

        url.query(href, function(key, value) {
            // We'll treat utm_* parameters differently than the rest of the URL
            // query parameters. By default query parameters should be prefixed
            // with "q_" but google analytics related params shouldn't need to.
            if (key.indexOf('utm_') === 0) {
                utm[key] = value;
            } else {
                query['q_' + key] = value;
            }
        });

        var data = merge([y.data, query, utm, {
            sessid: sessionId,
            uer: userEngagement.toFixed(2), // round to two decimals.
            ser: sessionEngagement.toFixed(2),
            ufq: userFq,
            sfq: sessionFq,
            referrer: escape(host + path + hash),
            path: escape(path),
            prev: referrer.clean(ref),
            traffic_source: traffic[0],
            traffic_type: traffic[1],
            traffic_keywords: traffic[2],
            traffic_history: history
        }]);

        y.stats.incr('track.count');

        return y.fire(data);
    };

    /**
     * Initialization.
     *
     * @return {Node}
     */
    y.init = function() {

        var run = {
            _elem: function() {},
            _dl: y.dl,
            _ab: y.ab
        };

        if (!y.data._ab) {
            y.ab();
        }

        for (var name in run) {
            if (y.data[name] !== undefined) {
                run[name].apply(null, y.data[name]);
                delete y.data[name];
            }
        }

        addEvent(window, 'message', function listener(event) {
            if (event.data === 'Do you haz teh cases?') {
                y.stats.set('y', true);
                y.stats.set('version', y.version);
                y.stats.set('domain', y.domain);
                y.stats.set('alias', alias);
                removeEvent(event.target, event.type, listener);
                event.source.postMessage(y.stats.all(), event.origin);
            }
        });

        return y.track();
    };

    /**
     * The current build version. This value is altered by Grunt during concat.
     *
     * @type {String}
     */
    y.version = '<%= pkg.version %>';

    /**
     * The server domain where we'll be sending tracking requests.
     *
     * @type {String}
     */
    y.domain = y.domain || 'n.254a.com';

    /**
     * For backwards compatibility.
     *
     * @type {Function}
     */
    window.ydResponse = y.callback;

    /**
     * Start execution based on configuration.
     */
    y.init();

})(window, window.document);
