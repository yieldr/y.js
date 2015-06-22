/**
 * Yieldr JavaScript Tracker
 *
 * This library is being served to clients implementing the Yieldr tracking
 * snippet. On a high level it defines a single JSON-P function responsible for
 * performing actions based on the tracking server response.
 *
 * @author Jasper Spijkstra <jasper.spijkstra@yieldr.com>
 * @author Alex Kalyvitis <alex.kalyvitis@yieldr.com>
 */
(function (window) {
    'use strict';

    var document = window.document,
        yieldr = window['YieldrTrackingObject'] || 'y',
        y = window[yieldr];

    // See: http://goo.gl/RkFUke
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
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
        forEach(mapping, function (key, value) {
            mapped[key] = extract(object, value.split('.'));
        });
        if (all) {
            forEach(object, function (key, value) {
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
            forEach(object, function (key, value) {
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
     * Adds an event to an element.
     *
     * @param {Node}     element
     * @param {String}   event
     * @param {Function} callback
     */
    function addEvent(element, event, callback) {
        if (element.addEventListener) {
            element.addEventListener(event, callback);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, callback);
        }
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
    var element = (function () {

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
            e.src = url;
            return e;
        }

        /**
         * Creates an <iframe> tag with specified content.
         *
         * @param  {String} content
         * @return {HTMLElement}
         */
        function html(content) {
            var e = document.body.appendChild(document.createElement('iframe'));
            e.frameBorder = 0;
            e.width = 0;
            e.height = 0;
            window.setTimeout(function () {
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
    var cookie = (function () {

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
            document.cookie = name + "=" + escape(value) + ";expires=" + date + ";domain=" + domain + ";path=/";
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
                return unescape(parts.pop().split(";").shift());
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
    var session = (function () {

        /**
         * The session storage object.
         *
         * @type {Object}
         */
        var storage = window.sessionStorage || {
            getItem: function (key) { return ""; },
            setItem: function (key, value) {}
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
    var strings = (function () {

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
    var url = (function () {

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

    var referrer = (function () {

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
                m = function (regex) {
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

    y.stats = (function () {

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
    y.callback = function (response) {
        var elements = [];
        if (response.status === 'success') {
            var body = document.getElementsByTagName("body")[0];
            y.stats.set('callback.cases', response.data.case_id);
            forEach(response.data, function (type, piggybacks) {
                forEach(piggybacks, function (i, piggyback) {
                    var func = element.map(type);
                    if (func && piggyback) {
                        elements.push(body.appendChild(func(piggyback)));
                        y.stats.push('callback.piggybacks', piggyback);
                    }
                });
            });
        }
        y.stats.incr('callback.count');
        return elements;
    };

    /**
     * Performs an HTTP request to the remote server.
     *
     * @param  {Object} params
     * @return {Node}   the element that was placed on the document
     */
    y.fire = function (params) {
        var pairs = [];
        forEach(params, function (key, value) {
            if (value !== undefined) {
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        });
        var element = document.createElement('script');
        element.src = document.location.protocol + '//' + y.domain + '/pixel?' + pairs.join('&');
        document.body.insertBefore(element, null);
        y.stats.set('fire.params', params);
        y.stats.set('fire.query', pairs.join('&'));
        y.stats.incr('fire.count');
        return element;
    };

    /**
     * Uses data from external sources such as a tag managers data layer.
     *
     * @param {Object}  object
     * @param {Object}  mapping
     * #param {Boolean} all
     */
    y.dl = function (object, mapping, all) {
        if (!mapping) {
            mapping = {};
        }
        var data = flatten(map(object, mapping, all));
        y.data = merge([y.data, data]);
        y.stats.set('datalayer.data', data);
        y.stats.incr('datalayer.count');
    };

    /**
     * Initiates tracking.
     *
     * @return {Node}
     */
    y.track = function () {
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

        // A/B testing.
        var group = cookie.get('_yldr_ab');
        if (['a', 'b'].indexOf(group) === -1) {
            group = (Math.random() >= 0.5) ? 'a': 'b';
            cookie.set('_yldr_ab', group, 30, host);
        }

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
            ab: group,
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
    (function () {

        var run = {
            _elem: function () { },
            _dl: y.dl
        };

        for (var name in run) {
            if (y.data[name] !== undefined) {
                run[name].apply(null, y.data[name]);
                delete y.data[name];
            }
        }

        addEvent(window, 'message', function (event) {
            y.stats.set('y.version', y.version);
            y.stats.set('y.domain', y.domain);
            y.stats.set('y.alias', yieldr);
            event.source.postMessage(y.stats.all(), event.origin)
        });

        y.track();
    }());

})(window);
