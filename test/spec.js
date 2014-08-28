/**
 * y
 *
 *    Library test
 */

'use strict'

var assert = require('assert'),
    phantom = require('phantom');

var example = '../examples/index.html';

describe('When loading the example page', function() {
  it('window.y should be defined', function() {
    phantom.create(function (p) {
        p.createPage(function (page) {
            page.open(example, function (status) {
                page.evaluate(function () { return window; }, function (window) {
                    assert.notEqual(window.y, undefined, 'y is undefined');
                    p.exit();
                });
            })
        })
    })
  })
})

describe('When running y.element.map(string)', function() {
  it('should return the window.y.element.script function', function() {
    phantom.create(function (p) {
        p.createPage(function (page) {
            page.open(example, function (status) {
                page.evaluate(function () { return window; }, function (window) {
                    assert.equal(window.y.element.map('script'), window.y.element.script, 'script function map is wrong');
                    p.exit();
                });
            })
        })
    })
  })
})