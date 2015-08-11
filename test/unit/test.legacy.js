'use strict';

var expect = require('expect.js'),
    _ = require('underscore');

var legacy = require('../../lib/legacy.js');

describe('Legacy', function() {

    describe('#makeCompatible()', function() {

        describe('v1', function() {
            var v1 = {
                data: {},
                domain: 'localhost',
                set: function(name, value) {
                    this.data[name] = value;
                }
            };
            v1.set('a', 1);
            v1.set('b', 2);
            v1.set('c', 3);
            v1.set('_dl', [{}, {}]);
            v1.set('_elem');

            var q = legacy.makeCompatible(v1);

            it('should map params to queued set() methods', function () {
                expect(q[0]).to.eql(['set', 'a', 1]);
                expect(q[1]).to.eql(['set', 'b', 2]);
                expect(q[2]).to.eql(['set', 'c', 3]);
            });

            it('should map _dl param to map() method', function () {
                expect(q[3]).to.eql(['map', {}, {}]);
            });

            it('should map domain to queued remote() method', function () {
                expect(q[4]).to.eql(['remote', 'localhost']);
            });

            it('should add a queued track() methid', function () {
                expect(q[5]).to.eql(['track']);
            });

            it('should ignore _elem param', function () {
                expect(q).to.have.length(6);
            });
        });

        describe('v2', function () {
            var v2 = [
                ['set', 'a', 1],
                ['set', 'b', 2],
                ['set', 'c', 3],
                ['map', {}, {}],
                ['track'],
            ];

            var q = legacy.makeCompatible(v2);

            it('should keep the queue as is', function () {
                expect(q).to.be.equal(v2);
            })
        })
    });
});
