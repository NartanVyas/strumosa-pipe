//var assert = require('assert');
var expect = require("chai").expect;
var demo = require("../app/demo");

describe('Demo suite', function () {
    describe('calculator', function () {
        it('should add two numbers', function () {
            const result = demo.add(1,1);
            expect(result).to.equal(2);
        });
    });
});
