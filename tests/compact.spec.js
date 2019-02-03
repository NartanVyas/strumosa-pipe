// var assert = require('assert');
const expect = require('chai').expect;
const compact = require('../app/compact');
const request = require('request');

describe('Compact', () => {
  describe('user', () => {
    const url = 'http://localhost:3000/user?name=timofeysie';

    it('returns status 200', () => {
      request(url, (error, response, body) => {
        console.log('response.statusCode', response.statusCode);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('returns status 200', () => {
        request(url, (error, response, body) => {
            console.log('body', body);
            expect(body).to.equal('what?');
            done();
        });
    });

  });
});