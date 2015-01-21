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
        if (path.length > 0) {
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
        var storage = window.sessionStorage;

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
        function query(url, prefix) {
            var split = url.split("?"),
                params = {};
            if (split.length >= 2) {
                var pairs = split[1].split('&');
                for (var i = 0, length = pairs.length; i < length; i++) {
                    var pair = pairs[i].split('=');
                    if (pair.length === 2) {
                        var key = prefix ? prefix + '_' + pair[0] : pair[0],
                            val = pair[1];
                        params[key] = val;
                    }
                }
            }
            return params;
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
         * @param  {Object} params
         * @return {Object}
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
            for (var piggybacks in response.data) {
                var func = element.map(piggybacks);
                for (var piggyback in response.data[piggybacks]) {
                    if (func) {
                        elements.push(body.appendChild(func(response.data[piggybacks][piggyback])));
                    }
                }
            }
        }
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
        pairs.push('yo=' + yieldr);
        var element = document.createElement('script');
        element.src = document.location.protocol + '//' + y.domain + '/pixel?' + pairs.join('&');
        document.body.insertBefore(element, null);
        return element;
    };

    /**
     * Attaches an event to an element. When the event triggers, a tracking call
     * if followed transferring the event to the server side.
     *
     * This method is called using an array as its only argument. This array
     * must contain an element selector as the first item and an event name as
     * the second argument.
     *
     * E.g:
     *
     *     y.elem(['a#submit', 'click']);
     *
     * @param  {Array} args
     */
    y.elem = function (args) {
        if (args.length < 2) {
            y.err('y.set("_elem", args): args is expected to have at least two elements.');
            return false;
        }
        var selector = args[0],
            event = args[1],
            callback = args[2] || function () {},
            elements = document.querySelectorAll(selector);
        var trigger = function () {
            callback(y.fire(merge([ y.data, { event: event, selector: selector } ])));
        };
        for (var i = 0, l = elements.length; i < l; i++) {
            addEvent(elements[i], event, trigger);
        }
    };

    /**
     * Uses data from external sources such as a tag managers data layer.
     *
     * @param  {Array} args
     */
    y.dl = function (args) {
        if (args.length < 1) {
            y.err('y.set("_dl", args): args is expected to have at least one element.');
            return false;
        }
        var object = args[0],
            mapping = args[1] || {},
            all = args[2] || false;
        y.data = merge([y.data, flatten(map(object, mapping, all))]);
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
            sessionNr++;
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
        var sessionEngagement = sessionFq / (Math.log(timeNow() - sessionTs) * 10);

        // The user engagement is calculated as the number of sessions divided
        // by the users total visits. More total visits and less sessions means
        // higher engagement.
        var userEngagement = 1 - (sessionNr / userFq);

        cookie.set('_yldr_user_fq', userFq, 30, host);
        cookie.set('_yldr_session_nr', sessionNr, 30, host);

        // A-B testing.
        var group = cookie.get('_yldr_ab');
        if (['a', 'b'].indexOf(group) === -1) {
            group = (Math.random() >= 0.5) ? 'a': 'b';
            cookie.set('_yldr_ab', group, 30, host);
        }

        var query = url.query(href, 'q'); // URL query parameters.

        var data = merge([y.data, query, {
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

        if (y.debug) {
            console.log("y", data);
        }

        return y.fire(data);
    };

    /**
     * The current build version. This value is altered by Grunt during concat.
     *
     * @type {String}
     */
    y.version = 'master';

    /**
     * The server domain where we'll be sending tracking requests.
     *
     * @type {String}
     */
    y.domain = y.domain || 'y.254a.com';

    /**
     * Start execution based on configuration.
     */
    (function () {

        var run = { '_elem': y.elem, '_dl': y.dl }; // Additional options.

        for (var name in run) {
            if (y.data[name] !== undefined) {
                run[name](y.data[name]);
                delete y.data[name];
            }
        }

        y.track();
    }());

})(window);
