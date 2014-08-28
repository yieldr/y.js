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
     * Places the piggybacks as given to us by the tracking server.
     *
     * @param  {Object}   response
     */
    y.callback = function (response) {
        if (response.status === 'success') {
            var body = document.getElementsByTagName("body")[0];
            for (var piggybacks in response.data) {
                var func = y.element.map(piggybacks);
                for (var piggyback in response.data[piggybacks]) {
                    body.appendChild(func(response.data[piggybacks][piggyback]));
                }
            }
        }
    };

    /**
     * Random four letter hash.
     *
     * @return {String}
     */
    y.hash = function () {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    };

    /**
     * Creates a unique session id.
     *
     * @return {String}
     */
    y.session = function () {
        return hash() + hash() + "-" + hash() + "-" + hash() + "-" + hash() + "-" + hash() + hash() + hash();
    };

    y.merge = function (merged, objects) {
        for (var i in objects) {
            for (var property in objects[i]) {
                merged[property] = objects[i][property];
            }
        }
        return merged;
    };

    /**
     * Describe an object which is able to manipulate html elements.
     *
     * @type {Object}
     */
    y.element = {

        /**
         * Maps element types to functions that can handle their placement.
         *
         * @return {Function}
         */
        map: function (type) {
            switch (type) {
            case 'html':
                return y.element.html;
            case 'image':
                return y.element.image;
            case 'script':
                return y.element.script;
            case 'iframe':
                return y.element.iframe;
            }
            return y.element.hidden;
        },

        /**
         * Alias to document.createElement
         *
         * @param  {String} type
         * @return {HTMLElement}
         */
        image: function (url) {
            var e = document.createElement('img');
            e.width = 0;
            e.height = 0;
            e.src = url;
            return e;
        },

        /**
         * Creates a <script> tag with specified url as source.
         *
         * @param  {String} url
         * @return {HTMLElement}
         */
        script: function (url) {
            var e = document.createElement('img');
            e.type = "text/javascript";
            e.src = url;
            e.async = !0;
            return e;
        },

        /**
         * Creates an <iframe> tag with specified url as source.
         *
         * @param  {String} url
         * @return {HTMLElement}
         */
        iframe: function (url) {
            var e = document.createElement('iframe');
            e.frameBorder = 0;
            e.src = url;
            return e;
        },

        /**
         * Creates a <div> tag with specified content as inner HTML.
         *
         * @param  {String} content
         * @return {HTMLElement}
         */
        html: function (content) {
            var e = document.createElement('div');
            e.innerHTML = content;
            return e;
        },

        /**
         * Creates a <div> tag with additional styling to make it hidden.
         * @param  {String} content
         * @return {HTMLElement}
         */
        hidden: function (content) {
            var e = y.element.html(content);
            e.style.display = "none";
            return e;
        }
    };

    /**
     * Describe an object which is able to manipulate cookies.
     *
     * @type {Object}
     */
    y.cookie = {

        /**
         * Sets a cookie.
         *
         * @param  {String} name
         * @param  {String} value
         * @param  {String} extDays
         * @param  {String} domain
         */
        set: function (name, value, extDays, domain) {
            var date = new Date();
            date.setDate(date.getDate() + extDays);
            document.cookie = name + "=" + escape(value) + ";expires=" + date + ";domain=" + domain + ";path=/";
        },

        /**
         * Gets a cookies value.
         *
         * @param  {String} name
         * @return {String}
         */
        get: function () {
            var value = document.cookie;
            var start = value.indexOf(" " + name + "=");
            if (start === -1) {
                start = value.indexOf(name + "=");
            }
            if (start === -1) {
                value = null;
            } else {
                start = value.indexOf("=", start) + 1;
                var end = value.indexOf(";", start);
                if (end === -1) {
                    end = value.length;
                }
                value = unescape(value.substring(start, end));
            }
            return value;
        }
    };

    /**
     * Describe an object which is able to manipulate a URL.
     *
     * @type {Object}
     */
    y.url = {

        /**
         * Extracts the URL query parameters in key value pairs.
         *
         * @param  {String} url
         * @return {Object}
         */
        parseQuery: function (url) {
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
    };

    y.referrer = {

        /**
         * Maps url regular expressions to third parties.
         *
         * @type {Object}
         */
        map: {
            "https?://(.*)criteo.([^/?]*)": "criteo",
            "https?://(.*)doubleclick.([^/?]*)": "doubleclick",
            "https?://(.*)turn.([^/?]*)": "turn",
            "https?://(.*)adnxs.([^/?]*)": "appnexus",
            "https?://(.*)rubiconproject.([^/?]*)": "rubicon",
            "https?://(.*)254a.([^/?]*)": "yieldr",
            "https?://(.*)google.([^/?]*)": "google",
            "https?://(.*)bing.com": "bing",
            "https?://(.*)yahoo.com": "yahoo"
        },

        /**
         * Display third parties.
         *
         * @type {Array}
         */
        display: ["criteo", "doubleclick", "turn", "appnexus", "rubicon", "yieldr"],

        /**
         * Search engines.
         *
         * @type {Array}
         */
        search: ["google", "bing", "yahoo"],

        /**
         * Returns true if the given name is a display third party.
         *
         * @param  {String}  name
         * @return {Boolean}
         */
        isDisplay: function (name) {
            return -1 !== y.referrer.display.indexOf(name);
        },

        /**
         * Returns true if the given name is a search engine.
         *
         * @param  {String}  name
         * @return {Boolean}
         */
        isSearch: function (name) {
            return -1 !== y.referrer.search.indexOf(name);
        },

        /**
         * Tries to match a name to a referrer url based on a known list.
         *
         * @param  {String} url
         * @return {String}
         */
        name: function (url) {
            for (var regex in y.referrer.map) {
                if (-1 !== url.search(regex)) {
                    return y.referrer.map[regex];
                }
            }
            return null;
        },

        /**
         * Cleans a url.
         *
         * @param  {String} url
         * @return {String}
         */
        clean: function (url) {
            if (url) {
                if (-1 !== url.search(/^https?\:\/\//)) {
                    url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
                } else {
                    url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");
                }
                return url[1];
            }
            return "NO_REFERRER";
        }

    };

    /**
     * Performs an HTTP request to the remote server.
     *
     * @param  {String} url
     * @param  {Object} params
     */
    y.fire = function (url, params) {
        var pairs = [];
        for (var key in params) {
            pairs.push(key + '=' + params[key]);
        }
        var element = document.createElement('script');
        element.src = url + '?' + pairs.join('&');
        document.head.appendChild(element);
    };

    /**
     * Initiates tracking.
     *
     * @param  {Object} data
     */
    y.track = function () {
        var sessionStorage = window.sessionStorage,
            location = document.location,
            path = location.pathname,
            host = location.hostname,
            href = location.href,
            server = ((location.protocol === 'https:') ? 'https:' : 'http:') + '//v.254a.com/pixel',
            referrer = document.referrer,
            history = '',
            data = y.data,
            params = y.url.parseQuery(href);
            // utm = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content'];

        var traffic = {
            type: 'other',
            source: y.referrer.name(referrer)
        };

        if (traffic.source !== null) {
            if (y.referrer.isSearch(referrerName)) {
                traffic.type = 'display';
            } else if (y.referrer.isDisplay(referrerName)) {
                traffic.type = 'search';
            } else if (host === y.referrer.clean(referrer)) {
                traffic.type = 'self';
            }
        }

        if (traffic.source === 'google') {
            data.utm_keyword = y.url.parseQuery(referrer).q;
        }

        history = y.cookie.get('yhist');
        if (history === null) {
            history = '';
        }

        // Probably has bugs. Redo this.
        if (sessionStorage.getItem('ysess') === null) {
            sessionStorage.setItem('ysess', y.session());
            sessionStorage.setItem('traffic_source', traffic.source);
            sessionStorage.setItem('traffic_type', traffic.type);
            if (history.search(traffic.source) === -1) {
                history = [history, traffic.source].join('|');
            }
        } else {
            traffic.source = sessionStorage.getItem('traffic_source');
            traffic.type = sessionStorage.getItem('traffic_type');
        }

        y.cookie.set('yhist', history, 30, host);

        y.merge(data, [params]);

        data.sessid = sessionStorage.getItem('ysess');
        data.referrer = escape(host + path);
        data.path = escape(path);
        data.prev = referrer;
        data.traffic_source = traffic.source;
        data.traffic_type = traffic.type;
        data.traffic_history = history;

        y.fire(server, data);
        window.setInterval(function () {
            y.fire(server, data);
        }, 10000);
    };

    y.track(); // Start tracking
})(window, document, window.y);