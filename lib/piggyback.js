'use strict';

/**
 * Constructor.
 *
 * @param {Document} document
 */
var Piggyback = module.exports = function(document) {

    /**
     * @type {Document}
     */
    this.document = document;

    /**
     * @type {Array}
     */
    this.supportedTypes = [
        'iframe',
        'script',
        'javascript',
        'image',
        'html'
    ];
};

Piggyback.prototype.create = function(type, value) {
    switch (type) {
        case 'html':
            return this.createHtmlElement(value);
        case 'image':
            return this.createImageElement(value);
        case 'script':
        case 'javascript':
            return this.createScriptElement(value);
        case 'iframe':
            return this.createIFrameElement(value);
    }
    return null;
};

/**
 * Alias for document.createElement
 *
 * @param  {String} type
 * @return {HTMLElement}
 */
Piggyback.prototype.createElement = function(type) {
    return this.document.createElement(type);
};

/**
 * Creates an html piggyback.
 *
 * @param  {String} content
 * @return {HTMLIFrameElement}
 */
Piggyback.prototype.createHtmlElement = function(content) {
    var element = this.createElement('iframe');
    element.frameBorder = 0;
    element.width = 0;
    element.height = 0;
    setTimeout(function() {
        var doc = element.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
    }, 1);

    return element;
};

/**
 * Creates an image piggyback.
 *
 * @param  {String} url
 * @return {HTMLImageElement}
 */
Piggyback.prototype.createImageElement = function(url) {
    var element = this.createElement('img');
    element.width = 0;
    element.height = 0;
    element.border = 0;
    element.src = url;

    return element;
};

/**
 * Creates an image piggyback.
 *
 * @param  {String} url
 * @return {HTMLScriptElement}
 */
Piggyback.prototype.createScriptElement = function(url) {
    var element = this.createElement('script');
    element.type = "text/javascript";
    element.src = url;
    element.async = true;

    return element;
};

/**
 * Creates an iframe piggyback.
 *
 * @param  {String} url
 * @return {HTMLIFrameElement}
 */
Piggyback.prototype.createIFrameElement = function (url) {
    var element = this.createElement('iframe');
    element.frameBorder = 0;
    element.width = 0;
    element.height = 0;
    element.src = url;

    return element;
};
