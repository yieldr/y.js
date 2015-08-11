'use strict';

var expect = require('expect.js');

var Query = require('../../lib/query.js');

describe('Query', function() {

    var query = new Query({
        search: '?a=1&b=2&utm_a=3&utm_b=4'
    });

    it('should be an instance of Query', function() {
        expect(query).to.be.an(Query);
    });

    describe('#init()', function() {
        it('should parse the url query', function() {
            expect(query.params).to.not.be(undefined);
            expect(query.params).to.have.property('a');
            expect(query.params).to.have.property('b');
            expect(query.params.a).to.be('1');
            expect(query.params.b).to.be('2');
        });
    });

    var all = query.all();

    describe('#all()', function() {
        it('should return parameters prefixed with "q_"', function() {
            expect(all).to.have.property('q_a');
            expect(all).to.have.property('q_b');
            expect(all.q_a).to.be('1');
            expect(all.q_b).to.be('2');
        });

        it('should return "utm_*" parameters without a prefix', function () {
            expect(all).to.have.property('utm_a');
            expect(all).to.have.property('utm_b');
            expect(all.utm_a).to.be('3');
            expect(all.utm_b).to.be('4');
        })
    });
})
