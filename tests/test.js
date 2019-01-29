// var assert = require('assert');
const expect = require('chai').expect;
const demo = require('../app/demo');

describe('Demo suite', () => {
  describe('calculator', () => {
    it('should add two numbers', () => {
      const result = demo.add(1, 1);
      expect(result).to.equal(2);
    });
  });
});
