const expect = require('chai').use(require('chai-as-promised'));
const request = require('request');

describe('Calculator API', () => {
  describe('Addition', () => {
    const url = 'http://localhost:3000/add?arg1=1&arg2=1';

    it('returns status 200', () => {
      request(url, (error, response, body) => {
        console.log('response.statusCode', response.statusCode);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('returns two arguments added together', () => {
      request(url, (error, response, body) => {
        console.log('body', body);
        expect(body).to.equal('21');
        done();
      });
    });
  });
});
