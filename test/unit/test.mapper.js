'use strict';

var expect = require('expect.js');

var mapper = require('../../lib/mapper.js');

describe('Mapper', function() {

    describe('#map()', function() {

        var source = {
            a: {
                b: {
                    c: "x",
                    d: "y",
                    e: ["foo", "bar"]
                },
                bb: function() {
                    return {
                        hello: "world!"
                    };
                }
            }
        };

        var mapped = mapper.map(source, {
            a: "a.b.c",
            b: "a.b",
            c: "a.bb",
            d: "z.xy"
        });

        it('"a.b.c" should be mapped to "a"', function() {
            expect(mapped).to.have.property('a');
            expect(mapped.a).to.be('x');
        });

        it('"a.b" should be mapped to "b_c", "b_d" and "b_e_0" "b_e_1"', function () {
            expect(mapped).to.have.property('b_c');
            expect(mapped).to.have.property('b_d');
            expect(mapped).to.have.property('b_e_0');
            expect(mapped).to.have.property('b_e_1');
        });

        it('"a.bb" should be mapped to "c_hello"', function () {
            expect(mapped).to.have.property('c_hello');
            expect(mapped.c_hello).to.be('world!');
        });

        it('"d" should be undefined', function () {
            expect(mapped.d).to.be(undefined);
        });
    });
})
