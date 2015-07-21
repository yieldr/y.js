'use strict';

var _ = require('underscore'),
    Piggyback = require('piggyback'),
    Stats = require('stats'),
    Referrer = require('referrer'),
    Cookie = require('cookie'),
    Session = require('session'),
    History = require('history'),
    AB = require('ab'),
    Query = require('query'),
    legacy = require('legacy'),
    mapper = require('mapper');

/**
 * Constructor.
 *
 * @param {Window} window
 * @param {Array}  queue
 */
var Yieldr = module.exports = function(window, queue) {

    queue = legacy.makeCompatible(queue);

    /**
     * @type {Window}
     */
    this.window = window;

    /**
     * @type {Document}
     */
    this.document = window.document;

    /**
     * @type {Piggyback}
     */
    this.piggyback = new Piggyback(window.document);

    /**
     * @type {Referrer}
     */
    this.referrer = new Referrer();

    /**
     * @type {Stats}
     */
    this.stats = new Stats();

    /**
     * @type {Cookie}
     */
    this.cookie = new Cookie(window.document);

    /**
     * @type {History}
     */
    this.history = new History(this.cookie);

    /**
     * @type {Session}
     */
    this.session = new Session(this.window, this.cookie);

    /**
     * @type {AB}
     */
    this.ab = new AB(this.cookie);

    /**
     * @type {Query}
     */
    this.query = new Query(this.document.location.href);

    /**
     * @type {Object}
     */
    this.data = {};

    /**
     * @type {String}
     */
    this.version = '__VERSION__';

    /**
     * @type {String}
     */
    this.tagVersion = queue.version;

    /**
     * @type {String}
     */
    this.url = 'y.254a.com';

    /**
     * @type {String}
     */
    this.alias = window.YieldrTrackingObject;

    this.init();
    this.apply(queue) ; // apply the queue as defined in the tag.
};

/**
 * Initialize.
 */
Yieldr.prototype.init = function() {
    this.stats.set('y', true);
    this.stats.set('version', this.version);
    this.stats.set('domain', this.url);
    this.stats.set('alias', this.alias);
};

/**
 * Stores a value at the given key.
 *
 * @param {String} key
 * @param {*}      value
 */
Yieldr.prototype.set = function(key, value) {
    this.data[key] = value;
};

/**
 * Picks elements from the object as defined by the mapping.
 *
 * @param {Object}  object
 * @param {Object}  mapping
 * @param {Boolean} all
 */
Yieldr.prototype.map = function(object, mapping, all) {
    mapping || (mapping = {});
    all || (all = false);
    var data = flatten(map(object, mapping, all));
    y.data = merge([y.data, data]);
    console.info('Function not implemented.')
};

/**
 * Set the url of the remote server.
 *
 * @param {String} url
 */
Yieldr.prototype.remote = function(url) {
    this.url = url;
};

/**
 * Places the piggybacks as returned by the server.
 *
 * @param  {Object} response
 * @return {Array}
 */
Yieldr.prototype.callback = function(response) {

    var elements = [],
        body = this.document.getElementsByTagName('body')[0];

    if (response.status === 'success') {
        this.stats.set('cases', response.data.cases || response.data.case_ids);
        _.each(this.piggyback.supportedTypes, function(type) {
            _.each(response.data[type] || [], function(piggyback) {
                var element = this.piggyback.create(type, piggyback);
                elements.push(body.appendChild(element));
                this.stats.push('piggybacks', piggyback);
            }, this);
        }, this);
    }

    this.stats.incr('callback');
    this.stats.send(this.window);

    return elements;
};

/**
 * Fires a tracking event.
 *
 * @param  {Object} params
 * @return {HTMLElement}
 */
Yieldr.prototype.fire = function(params) {

    params = params || {};
    params.yo = this.alias;

    var encode = encodeURIComponent,
        body = this.document.getElementsByTagName('body')[0],
        query = [];

    _.each(params, function (value, key) {
        if (!_.isUndefined(value)) {
            query.push(encode(key) + '=' + encode(value));
        }
    });

    var element = this.piggyback.create('script',
        this.document.location.protocol + '//' + this.url + '/pixel?' + query.join('&'));

    this.stats.set('parameters', params);
    this.stats.incr('fire');

    return body.appendChild(element);
};

/**
 * Tracks a page view. This function is a superset of the fire function which
 * gathers additional information from the page before firing.
 *
 * @return {HTMLElement}
 */
Yieldr.prototype.track = function() {
    // Aliases.
    var document = this.document,
        session = this.session,
        location = document.location,
        referrer = document.referrer || 'NO_REFERRER';

    // Traffic type source.
    var traffic = {
        type: this.referrer.getType(referrer),
        source: this.referrer.getName(referrer)
    };

    // History of traffic sources.
    var history = this.history.get();
    history.push(traffic.source);
    this.history.set(history);

    // The parameters we'll send to the server with this tracking request. These
    // are merged with the data the user has set or the urls query parameters.
    var params = _.extend(this.data, this.query.all(), {
        ab: this.ab.group,
        ufq: session.ufq,
        sfq: session.sfq,
        uer: session.userEngagement().toFixed(2),
        ser: session.sessionEngagement().toFixed(2),
        path: escape(location.pathname),
        prev: this.referrer.cleanUrl(referrer),
        sessid: session.id,
        referrer: escape(location.hostname + location.pathname + location.hash),
        traffic_source: traffic.source,
        traffic_type: traffic.type,
        traffic_history: history.join('|')
    });

    return this.fire(params);
};

/**
 * Applies the queue.
 *
 * @param  {Array} queue
 */
Yieldr.prototype.apply = function(queue) {
    _.each(queue, function (args) {
        var func = _.head(args);
        if (_.isFunction(this[func])) {
            this[func].apply(this, _.tail(args));
        }
    }, this);
};
