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
(function (window, document, y) {
    'use strict';

    /**
     * Random four letter hash.
     *
     * @return {String}
     */
    function hash() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    /**
     * Creates a unique session id.
     *
     * @return {String}
     */
    function session() {
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
        for (var i in objects) {
            for (var property in objects[i]) {
                merged[property] = objects[i][property];
            }
        }
        return merged;
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
                return this.html;
            case 'image':
                return this.image;
            case 'script':
                return this.script;
            case 'iframe':
                return this.iframe;
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
            var e = document.createElement('iframe');
            e.frameBorder = 0;
            e.width = 0;
            e.height = 0;
            e.onload = function () {
                var d = e.contentDocument;
                d.open();
                d.write(content);
                d.close();
            };
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
     * Represents a set data structure for storing history.
     *
     * @return {Object}
     */
    var history = (function () {

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
            return this;
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
         * Splits a string of elements and stores in the set.
         *
         * @param  {String} sep
         */
        function split(str, sep) {
            var elements = str.split(sep);
            for (var i in elements) {
                add(elements[i]);
            }
            return this;
        }

        return {
            add: add,
            join: join,
            split: split
        };
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
         * @return {Object}
         */
        function parseQuery(url) {
            var split = url.split("?"),
                query = {};
            if (split.length >= 2) {
                var pairs = split[1].split('&');
                for (var i = 0, length = pairs.length; i < length; i++) {
                    var pair = pairs[i].split('=');
                    if (pair.length === 2) {
                        query[pair[0]] = pair[1];
                    }
                }
            }
            return query;
        }

        return {
            parseQuery: parseQuery
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

        return {
            name: name,
            type: type,
            clean: clean
        };

    }());

    /**
     * Places the piggybacks as given to us by the tracking server.
     *
     * @param  {Object}   response
     */
    y.callback = function (response) {
        if (response.status === 'success') {
            var body = document.getElementsByTagName("body")[0];
            for (var piggybacks in response.data) {
                var func = element.map(piggybacks);
                for (var piggyback in response.data[piggybacks]) {
                    if (func) {
                        body.appendChild(func(response.data[piggybacks][piggyback]));
                    }
                }
            }
        }
    };

    /**
     * Performs an HTTP request to the remote server.
     *
     * @param  {Object} params
     */
    y.fire = function (params) {
        var pairs = [];
        for (var key in params) {
            pairs.push(key + '=' + params[key]);
        }
        var element = document.createElement('script');
        element.src = document.location.protocol + '//y.254a.com/pixel' + '?' + pairs.join('&');
        document.body.insertBefore(element, null);
    };

    /**
     * Initiates tracking.
     *
     * @param  {Object} data
     */
    y.track = function () {
        var sessionStorage = window.sessionStorage,
            sessid = sessionStorage.getItem('ysess'),
            location = document.location,
            path = location.pathname,
            host = location.hostname,
            href = location.href,
            ref = document.referrer || 'NO_REFERRER',
            trafficSource = referrer.name(ref),
            trafficType = referrer.type(trafficSource),
            params = url.parseQuery(href);

        if (trafficSource === host) {
            trafficType = 'self';
        }

        cookie.set('yhist', history.split(cookie.get('yhist'), '|').add(trafficSource).join('|'), 30, host);

        if (!sessid) {
            sessid = session();
            sessionStorage.setItem('ysess', sessid);
            sessionStorage.setItem('ytsrc', trafficSource);
            sessionStorage.setItem('ytt', trafficType);
        } else {
            trafficSource = sessionStorage.getItem('ytsrc');
            trafficType = sessionStorage.getItem('ytt');
        }

        var data = merge([y.data, params]);
        data.sessid = sessid;
        data.referrer = escape(host + path);
        data.path = escape(path);
        data.prev = referrer.clean(ref);
        data.traffic_source = trafficSource;
        data.traffic_type = trafficType;
        data.traffic_history = cookie.get('yhist');

        if (y.debug) {
            console.log("q", data);
        }

        y.fire(data);
    };

    /**
     * The current build version. This value is altered by Grunt during concat.
     *
     * @type {String}
     */
    y.version = 'master';

    y.track(); // Start tracking
})(window, document, window.y);